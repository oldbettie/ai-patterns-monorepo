// @feature:clipboard-sync @domain:sync @backend
// @summary: High-level sync client that coordinates REST client, WebSocket, and queue

package sync

import (
	"clipboard-agent/pkg/config"
	"clipboard-agent/pkg/system"
	"context"
	"fmt"
	"log"
	"sync"
)

// SyncClient provides high-level clipboard synchronization
type SyncClient struct {
	apiClient       *Client
	deviceManager   *system.DeviceManager
	onItemReceived  func(config.ClipboardItem)
	connected       bool
	disconnectChan  chan struct{}
	mutex           sync.RWMutex
}

// NewSyncClient creates a new high-level sync client
func NewSyncClient(apiURL string, agentConfig *config.AgentConfig, deviceManager *system.DeviceManager) *SyncClient {
	client := NewClient(apiURL, agentConfig.DeviceID, agentConfig.AccessToken)
	
	syncClient := &SyncClient{
		apiClient:      client,
		deviceManager:  deviceManager,
		disconnectChan: make(chan struct{}),
	}
	
	// Set up API client callbacks
	client.SetCallbacks(
		func(item config.ClipboardItem) {
			if syncClient.onItemReceived != nil {
				syncClient.onItemReceived(item)
			}
		},
		func() {
			syncClient.mutex.Lock()
			syncClient.connected = true
			syncClient.mutex.Unlock()
			log.Println("WebSocket connected")
		},
		func() {
			syncClient.mutex.Lock()
			wasConnected := syncClient.connected
			syncClient.connected = false
			syncClient.mutex.Unlock()
			
			if wasConnected {
				log.Println("WebSocket disconnected")
				select {
				case syncClient.disconnectChan <- struct{}{}:
				default:
				}
			}
		},
	)
	
	return syncClient
}

// Connect establishes connection to the sync service
func (sc *SyncClient) Connect(ctx context.Context) error {
	config := sc.deviceManager.GetConfig()
	
	// If no access token, work in offline mode for now
	if config.AccessToken == "" {
		log.Println("No access token configured, working in offline mode")
		return nil
	}
	
	// First, try to backfill any missed items
	if config.LastSeq > 0 {
		items, err := sc.apiClient.FetchSince(ctx, config.LastSeq, 100)
		if err != nil {
			log.Printf("Failed to backfill items: %v", err)
		} else if len(items) > 0 {
			log.Printf("Backfilled %d missed items", len(items))
			for _, item := range items {
				if sc.onItemReceived != nil {
					sc.onItemReceived(item)
				}
				// Update last sequence
				if item.Seq > config.LastSeq {
					config.LastSeq = item.Seq
				}
			}
			// Save updated sequence
			sc.deviceManager.UpdateConfig(config)
		}
	}
	
	// Connect WebSocket
	if err := sc.apiClient.ConnectWebSocket(ctx); err != nil {
		return err
	}
	
	return nil
}

// Disconnect closes the connection to the sync service
func (sc *SyncClient) Disconnect() {
	sc.apiClient.DisconnectWebSocket()
}

// SendItem sends a clipboard item to the sync service
func (sc *SyncClient) SendItem(ctx context.Context, item config.ClipboardItem) error {
	config := sc.deviceManager.GetConfig()
	
	// If no access token, fail (will be queued by caller)
	if config.AccessToken == "" {
		return fmt.Errorf("no access token configured")
	}
	
	// Send item to server
	serverItem, err := sc.apiClient.CreateItem(ctx, item)
	if err != nil {
		return err
	}
	
	// Update last sequence number
	if serverItem.Seq > config.LastSeq {
		config.LastSeq = serverItem.Seq
		sc.deviceManager.UpdateConfig(config)
	}
	
	return nil
}

// OnItemReceived sets the callback for when remote items are received
func (sc *SyncClient) OnItemReceived(callback func(config.ClipboardItem)) {
	sc.onItemReceived = callback
}

// IsConnected returns true if connected to the sync service
func (sc *SyncClient) IsConnected() bool {
	sc.mutex.RLock()
	defer sc.mutex.RUnlock()
	return sc.connected
}

// WaitForDisconnect blocks until disconnected
func (sc *SyncClient) WaitForDisconnect() {
	<-sc.disconnectChan
}