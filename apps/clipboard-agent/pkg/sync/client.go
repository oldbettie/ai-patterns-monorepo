// @feature:clipboard-sync @domain:sync @backend
// @summary: REST and WebSocket client for clipboard synchronization

package sync

import (
	"bytes"
	"clipboard-agent/pkg/config"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Client handles communication with the clipboard sync API
type Client struct {
	baseURL     string
	deviceID    string
	accessToken string
	httpClient  *http.Client
	wsConn      *websocket.Conn
	wsURL       string
	
	// Callbacks for events
	onItemReceived   func(config.ClipboardItem)
	onConnected      func()
	onDisconnected   func()
	
	// State management
	mutex          sync.RWMutex
	connected      bool
	reconnectDelay time.Duration
}

// NewClient creates a new sync client
func NewClient(baseURL, deviceID, accessToken string) *Client {
	return &Client{
		baseURL:        baseURL,
		deviceID:       deviceID,
		accessToken:    accessToken,
		httpClient:     &http.Client{Timeout: 30 * time.Second},
		reconnectDelay: 5 * time.Second,
	}
}

// CreateItem sends a clipboard item to the server
func (c *Client) CreateItem(ctx context.Context, item config.ClipboardItem) (*config.ClipboardItem, error) {
	url := fmt.Sprintf("%s/api/core/v1/clipboard/items", c.baseURL)
	
	jsonData, err := json.Marshal(item)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal item: %w", err)
	}
	
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.accessToken))
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("server returned status %d", resp.StatusCode)
	}
	
	var response struct {
		Data  *config.ClipboardItem `json:"data"`
		Error *string               `json:"error"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	if response.Error != nil {
		return nil, fmt.Errorf("server error: %s", *response.Error)
	}
	
	return response.Data, nil
}

// FetchSince fetches clipboard items since the given sequence number
func (c *Client) FetchSince(ctx context.Context, sinceSeq int64, limit int) ([]config.ClipboardItem, error) {
	u, err := url.Parse(fmt.Sprintf("%s/api/core/v1/clipboard/items", c.baseURL))
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}
	
	params := url.Values{}
	params.Set("since", fmt.Sprintf("%d", sinceSeq))
	if limit > 0 {
		params.Set("limit", fmt.Sprintf("%d", limit))
	}
	u.RawQuery = params.Encode()
	
	req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.accessToken))
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server returned status %d", resp.StatusCode)
	}
	
	var response struct {
		Data  []config.ClipboardItem `json:"data"`
		Error *string                `json:"error"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	if response.Error != nil {
		return nil, fmt.Errorf("server error: %s", *response.Error)
	}
	
	return response.Data, nil
}

// ConnectWebSocket establishes a WebSocket connection for real-time updates
func (c *Client) ConnectWebSocket(ctx context.Context) error {
	wsURL := c.getWebSocketURL()
	
	headers := http.Header{}
	headers.Set("Authorization", fmt.Sprintf("Bearer %s", c.accessToken))
	
	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
	}
	
	conn, _, err := dialer.Dial(wsURL, headers)
	if err != nil {
		return fmt.Errorf("websocket connection failed: %w", err)
	}
	
	c.mutex.Lock()
	c.wsConn = conn
	c.connected = true
	c.mutex.Unlock()
	
	if c.onConnected != nil {
		go c.onConnected()
	}
	
	// Start message handling loop
	go c.handleWebSocketMessages(ctx)
	
	log.Println("WebSocket connected successfully")
	return nil
}

// DisconnectWebSocket closes the WebSocket connection
func (c *Client) DisconnectWebSocket() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	if c.wsConn != nil {
		c.connected = false
		err := c.wsConn.Close()
		c.wsConn = nil
		
		if c.onDisconnected != nil {
			go c.onDisconnected()
		}
		
		return err
	}
	
	return nil
}

// SetCallbacks configures event callbacks
func (c *Client) SetCallbacks(onItem func(config.ClipboardItem), onConnected, onDisconnected func()) {
	c.onItemReceived = onItem
	c.onConnected = onConnected
	c.onDisconnected = onDisconnected
}

// IsConnected returns true if WebSocket is connected
func (c *Client) IsConnected() bool {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.connected
}

// handleWebSocketMessages processes incoming WebSocket messages
func (c *Client) handleWebSocketMessages(ctx context.Context) {
	defer func() {
		c.mutex.Lock()
		c.connected = false
		c.mutex.Unlock()
		
		if c.onDisconnected != nil {
			c.onDisconnected()
		}
	}()
	
	for {
		select {
		case <-ctx.Done():
			return
		default:
			c.mutex.RLock()
			conn := c.wsConn
			c.mutex.RUnlock()
			
			if conn == nil {
				return
			}
			
			var message config.RemoteClipboardMessage
			err := conn.ReadJSON(&message)
			if err != nil {
				log.Printf("WebSocket read error: %v", err)
				return
			}
			
			// Skip messages from this device
			if message.DeviceID == c.deviceID {
				continue
			}
			
			if c.onItemReceived != nil {
				go c.onItemReceived(message.Item)
			}
		}
	}
}

// getWebSocketURL converts HTTP URL to WebSocket URL
func (c *Client) getWebSocketURL() string {
	u, _ := url.Parse(c.baseURL)
	
	if u.Scheme == "https" {
		u.Scheme = "wss"
	} else {
		u.Scheme = "ws"
	}
	
	u.Path = "/api/core/v1/clipboard/ws"
	return u.String()
}