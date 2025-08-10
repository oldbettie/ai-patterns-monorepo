// @feature:clipboard-sync @domain:api @backend
// @summary: HTTP client for clipboard synchronization with encryption support

package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"clipboard-agent/pkg/encryption"
)

// APIClient handles communication with the clipboard sync server
type APIClient struct {
	baseURL     string
	apiKey      string
	deviceID    string
	httpClient  *http.Client
	encryption  *encryption.EncryptionManager
	lastSeq     int
}

// SyncResponse represents the API response structure
type SyncResponse struct {
	Data  interface{} `json:"data"`
	Error interface{} `json:"error"`
}

// ClipboardItem represents a clipboard item from the API
type ClipboardItem struct {
	ID                  string                 `json:"id"`
	Seq                 int                    `json:"seq"`
	Type                string                 `json:"type"`
	Mime                string                 `json:"mime,omitempty"`
	Content             string                 `json:"content"`
	ContentHash         string                 `json:"contentHash"`
	SizeBytes           int                    `json:"sizeBytes"`
	IsEncrypted         bool                   `json:"isEncrypted"`
	EncryptionAlgorithm string                 `json:"encryptionAlgorithm,omitempty"`
	Metadata            map[string]interface{} `json:"metadata,omitempty"`
	DeviceID            string                 `json:"deviceId"`
	CreatedAt           time.Time              `json:"createdAt"`
}

// PollResponse represents the response from polling for clipboard items
type PollResponse struct {
	Items   []ClipboardItem `json:"items"`
	LastSeq int             `json:"lastSeq"`
	Count   int             `json:"count"`
}

// SyncRequest represents a request to sync a clipboard item
type SyncRequest struct {
	Type                string                 `json:"type"`
	Mime                string                 `json:"mime,omitempty"`
	Content             string                 `json:"content"`
	ContentHash         string                 `json:"contentHash"`
	SizeBytes           int                    `json:"sizeBytes"`
	IsEncrypted         bool                   `json:"isEncrypted"`
	EncryptionAlgorithm string                 `json:"encryptionAlgorithm,omitempty"`
	Metadata            map[string]interface{} `json:"metadata,omitempty"`
}

// SyncItemResponse represents the response from syncing an item
type SyncItemResponse struct {
	ID       string `json:"id"`
	Seq      int    `json:"seq"`
	Created  bool   `json:"created"`
	DeviceID string `json:"deviceId"`
	Message  string `json:"message,omitempty"`
}

// NewAPIClient creates a new API client
func NewAPIClient(baseURL, apiKey, deviceID string, encryptionManager *encryption.EncryptionManager) *APIClient {
	return &APIClient{
		baseURL:    baseURL,
		apiKey:     apiKey,
		deviceID:   deviceID,
		encryption: encryptionManager,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		lastSeq: 0,
	}
}

// SetLastSeq updates the last sequence number
func (c *APIClient) SetLastSeq(seq int) {
	c.lastSeq = seq
}

// GetLastSeq returns the current last sequence number
func (c *APIClient) GetLastSeq() int {
	return c.lastSeq
}

// makeRequest makes an authenticated HTTP request
func (c *APIClient) makeRequest(method, endpoint string, body interface{}) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		bodyReader = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequest(method, c.baseURL+endpoint, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add authentication header
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "clipboard-agent/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	return resp, nil
}

// parseResponse parses the API response
func (c *APIClient) parseResponse(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		var syncResp SyncResponse
		if err := json.Unmarshal(body, &syncResp); err == nil && syncResp.Error != nil {
			return fmt.Errorf("API error (%d): %v", resp.StatusCode, syncResp.Error)
		}
		return fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	var syncResp SyncResponse
	if err := json.Unmarshal(body, &syncResp); err != nil {
		return fmt.Errorf("failed to parse response: %w", err)
	}

	if syncResp.Error != nil {
		return fmt.Errorf("API error: %v", syncResp.Error)
	}

	// Convert the data to target type
	dataBytes, err := json.Marshal(syncResp.Data)
	if err != nil {
		return fmt.Errorf("failed to marshal response data: %w", err)
	}

	if err := json.Unmarshal(dataBytes, target); err != nil {
		return fmt.Errorf("failed to unmarshal response data: %w", err)
	}

	return nil
}

// SyncClipboardItem sends a clipboard item to the server with encryption
func (c *APIClient) SyncClipboardItem(content, contentType string, metadata map[string]interface{}) (*SyncItemResponse, error) {
	// Encrypt content if encryption is enabled
	encryptedContent, err := c.encryption.EncryptContent(content)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt content: %w", err)
	}

	// Generate content hash for deduplication
	contentHash := c.encryption.GenerateContentHash(encryptedContent)

	// Determine MIME type
	mime := contentType
	if mime == "" {
		mime = "text/plain"
	}

	// Create sync request
	syncReq := SyncRequest{
		Type:                "text", // Default to text for now
		Mime:                mime,
		Content:             encryptedContent.Ciphertext,
		ContentHash:         contentHash,
		SizeBytes:           len(encryptedContent.Ciphertext),
		IsEncrypted:         encryptedContent.IsEncrypted,
		EncryptionAlgorithm: encryptedContent.Algorithm,
		Metadata:            metadata,
	}

	// Make API request
	resp, err := c.makeRequest("POST", "/api/core/v1/clipboard/sync", syncReq)
	if err != nil {
		return nil, err
	}

	var result SyncItemResponse
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// PollForUpdates polls for new clipboard items since the last sequence number
func (c *APIClient) PollForUpdates() (*PollResponse, error) {
	endpoint := fmt.Sprintf("/api/core/v1/clipboard/sync?since=%d&limit=50&excludeDevice=true", c.lastSeq)

	resp, err := c.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var result PollResponse
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	// Update last sequence number if we got items
	if result.LastSeq > c.lastSeq {
		c.lastSeq = result.LastSeq
	}

	return &result, nil
}

// DecryptClipboardItem decrypts a clipboard item content
func (c *APIClient) DecryptClipboardItem(item *ClipboardItem) (string, error) {
	if !item.IsEncrypted {
		return item.Content, nil
	}

	encryptedContent := &encryption.EncryptedContent{
		Algorithm:   item.EncryptionAlgorithm,
		Ciphertext:  item.Content,
		IsEncrypted: item.IsEncrypted,
	}

	return c.encryption.DecryptContent(encryptedContent)
}

// TestConnection tests the API connection and authentication
func (c *APIClient) TestConnection() error {
	resp, err := c.makeRequest("GET", "/api/core/v1/clipboard/sync?since=0&limit=1", nil)
	if err != nil {
		return fmt.Errorf("connection test failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 401 {
		return fmt.Errorf("authentication failed: invalid API key")
	}

	if resp.StatusCode == 403 {
		return fmt.Errorf("access forbidden: device may not be verified")
	}

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error (%d): %s", resp.StatusCode, string(body))
	}

	return nil
}

// GetInitialSeq fetches the current latest sequence number to initialize polling
func (c *APIClient) GetInitialSeq() (int, error) {
	pollResp, err := c.PollForUpdates()
	if err != nil {
		return 0, err
	}

	return pollResp.LastSeq, nil
}