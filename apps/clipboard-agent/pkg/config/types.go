// @feature:config-management @domain:config @backend
// @summary: Configuration types for clipboard agent

package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// AgentConfig represents the configuration for a clipboard agent instance
type AgentConfig struct {
	DeviceID       string        `json:"device_id"`
	DeviceName     string        `json:"device_name"`         // user-friendly device name
	AccessToken    string        `json:"access_token"`        // persisted session token
	WsAuthToken    string        `json:"ws_auth_token"`       // short-lived, refreshed
	LastSeq        int64         `json:"last_seq"`            // last applied server seq
	QueuePath      string        `json:"queue_path"`
	MaxItemBytes   int64         `json:"max_item_bytes"`
	AllowImages    bool          `json:"allow_images"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}

// ClipboardItem represents a clipboard item that can be synchronized
type ClipboardItem struct {
	ID            string            `json:"id"`
	UserID        string            `json:"user_id"`
	DeviceID      string            `json:"device_id"`
	Seq           int64             `json:"seq"`              // server assigned
	Type          string            `json:"type"`             // "text" | "image"
	Mime          string            `json:"mime"`             // e.g. "text/plain"
	Text          string            `json:"text,omitempty"`
	ImageBase64   string            `json:"image_base64,omitempty"` // initial impl
	ContentHash   string            `json:"content_hash"`      // sha256
	SizeBytes     int64             `json:"size_bytes"`
	Meta          map[string]string `json:"meta,omitempty"`    // e.g. width,height
	CreatedAt     time.Time         `json:"created_at"`
}

// ClipboardType defines the type of clipboard content
type ClipboardType string

const (
	TypeText  ClipboardType = "text"
	TypeImage ClipboardType = "image"
)

// WebSocketMessage represents a message sent over WebSocket for real-time sync
type WebSocketMessage struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

// RemoteClipboardMessage represents a clipboard item received via WebSocket
type RemoteClipboardMessage struct {
	Item     ClipboardItem `json:"item"`
	DeviceID string        `json:"device_id"`
}

// DefaultConfig returns a default configuration for development
func DefaultConfig() *AgentConfig {
	return &AgentConfig{
		DeviceID:     "dev-device-123",
		QueuePath:    "./clipboard-queue.db",
		MaxItemBytes: 10 * 1024 * 1024, // 10MB
		AllowImages:  true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
}

// LoadConfig loads configuration from the specified path
func LoadConfig(configPath string) (*AgentConfig, error) {
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("config file does not exist: %s", configPath)
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config AgentConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return &config, nil
}

// SaveConfig saves configuration to the specified path
func SaveConfig(config *AgentConfig, configPath string) error {
	// Create directory if it doesn't exist
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// Update timestamp
	config.UpdatedAt = time.Now()

	// Marshal to JSON with indentation
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// Write to file with secure permissions
	if err := os.WriteFile(configPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// HasStoredAuth checks if the config file contains authentication data
func HasStoredAuth(configPath string) bool {
	config, err := LoadConfig(configPath)
	if err != nil {
		return false
	}
	
	return config.AccessToken != ""
}

// ClearStoredAuth removes authentication data from config file
func ClearStoredAuth(configPath string) error {
	config, err := LoadConfig(configPath)
	if err != nil {
		// If config doesn't exist, that's fine - nothing to clear
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to load config for clearing auth: %w", err)
	}

	// Clear auth-related fields
	config.AccessToken = ""
	config.WsAuthToken = ""
	config.LastSeq = 0

	// Save updated config
	return SaveConfig(config, configPath)
}