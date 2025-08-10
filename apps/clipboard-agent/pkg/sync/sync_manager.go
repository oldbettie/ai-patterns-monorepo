// @feature:clipboard-sync @domain:sync @backend
// @summary: Manages clipboard synchronization with encryption and polling

package sync

import (
	"context"
	"fmt"
	"log"
	"time"

	"clipboard-agent/pkg/api"
	"clipboard-agent/pkg/clipboard"
	"clipboard-agent/pkg/config"
	"clipboard-agent/pkg/encryption"
)

// SyncManager handles clipboard synchronization between local and remote
type SyncManager struct {
	apiClient         *api.APIClient
	clipboardMonitor  clipboard.Manager
	encryptionManager *encryption.EncryptionManager
	
	// Configuration
	pollInterval      time.Duration
	retryInterval     time.Duration
	maxRetries        int
	
	// State
	isRunning         bool
	lastError         error
	stopChan          chan struct{}
	
	// Statistics
	itemsSynced       int64
	itemsReceived     int64
	lastSyncTime      time.Time
	lastPollTime      time.Time
}

// SyncManagerConfig holds configuration for the sync manager
type SyncManagerConfig struct {
	BaseURL           string
	APIKey            string
	DeviceID          string
	PollInterval      time.Duration // How often to poll for updates
	RetryInterval     time.Duration // How long to wait before retrying failed operations
	MaxRetries        int           // Maximum number of retry attempts
}

// NewSyncManager creates a new sync manager
func NewSyncManager(config SyncManagerConfig, encryptionManager *encryption.EncryptionManager) (*SyncManager, error) {
	// Create API client
	apiClient := api.NewAPIClient(config.BaseURL, config.APIKey, config.DeviceID, encryptionManager)
	
	// Test connection
	if err := apiClient.TestConnection(); err != nil {
		return nil, fmt.Errorf("failed to connect to API: %w", err)
	}
	
	// Initialize clipboard monitor
	clipboardMonitor, err := clipboard.NewMonitor()
	if err != nil {
		return nil, fmt.Errorf("failed to create clipboard monitor: %w", err)
	}
	
	// Set default configuration
	if config.PollInterval == 0 {
		config.PollInterval = 5 * time.Second
	}
	if config.RetryInterval == 0 {
		config.RetryInterval = 10 * time.Second
	}
	if config.MaxRetries == 0 {
		config.MaxRetries = 3
	}
	
	manager := &SyncManager{
		apiClient:         apiClient,
		clipboardMonitor:  clipboardMonitor,
		encryptionManager: encryptionManager,
		pollInterval:      config.PollInterval,
		retryInterval:     config.RetryInterval,
		maxRetries:        config.MaxRetries,
		stopChan:          make(chan struct{}),
	}
	
	return manager, nil
}

// Start begins the sync process
func (sm *SyncManager) Start(ctx context.Context) error {
	if sm.isRunning {
		return fmt.Errorf("sync manager is already running")
	}
	
	sm.isRunning = true
	defer func() { sm.isRunning = false }()
	
	log.Println("Starting clipboard sync manager...")
	
	// Get initial sequence number
	initialSeq, err := sm.apiClient.GetInitialSeq()
	if err != nil {
		log.Printf("Warning: Could not get initial sequence number: %v", err)
	} else {
		sm.apiClient.SetLastSeq(initialSeq)
		log.Printf("Initialized with sequence number: %d", initialSeq)
	}
	
	// Start clipboard monitoring
	if err := sm.clipboardMonitor.Start(ctx); err != nil {
		return fmt.Errorf("failed to start clipboard monitoring: %w", err)
	}
	defer sm.clipboardMonitor.Stop()

	// Register callback for clipboard changes
	sm.clipboardMonitor.OnChange(func(item config.ClipboardItem) {
		// Convert config.ClipboardItem to clipboard.Content
		content := clipboard.Content{
			Type: item.Type,
			Text: item.Text,
		}
		// Handle image data if present
		if item.ImageBase64 != "" {
			content.Type = "image"
			content.Format = item.Mime
			// In a real implementation, we'd decode the base64 data
			// content.ImageData = decoded image data
		}
		sm.handleLocalClipboardChange(content)
	})
	
	// Start polling timer
	pollTicker := time.NewTicker(sm.pollInterval)
	defer pollTicker.Stop()
	
	// Start immediate poll
	go sm.pollForUpdates()
	
	for {
		select {
		case <-ctx.Done():
			log.Println("Sync manager stopping due to context cancellation")
			return ctx.Err()
			
		case <-sm.stopChan:
			log.Println("Sync manager stopping due to stop signal")
			return nil
			
		case <-pollTicker.C:
			// Poll for remote updates
			go sm.pollForUpdates()
		}
	}
}

// Stop stops the sync manager
func (sm *SyncManager) Stop() {
	if sm.isRunning {
		close(sm.stopChan)
	}
}

// handleLocalClipboardChange processes a local clipboard change
func (sm *SyncManager) handleLocalClipboardChange(content clipboard.Content) {
	if content.Text == "" {
		return // Skip empty clipboard
	}
	
	log.Printf("Local clipboard change detected: %d bytes", len(content.Text))
	
	// Sync to server with retries
	var lastErr error
	for attempt := 0; attempt < sm.maxRetries; attempt++ {
		result, err := sm.apiClient.SyncClipboardItem(content.Text, "text/plain", nil)
		if err != nil {
			lastErr = err
			log.Printf("Failed to sync clipboard item (attempt %d/%d): %v", attempt+1, sm.maxRetries, err)
			time.Sleep(sm.retryInterval)
			continue
		}
		
		// Success
		sm.itemsSynced++
		sm.lastSyncTime = time.Now()
		sm.lastError = nil
		
		if result.Created {
			log.Printf("Successfully synced new clipboard item (ID: %s, Seq: %d)", result.ID, result.Seq)
		} else {
			log.Printf("Clipboard item already exists (ID: %s): %s", result.ID, result.Message)
		}
		return
	}
	
	// All retries failed
	sm.lastError = lastErr
	log.Printf("Failed to sync clipboard item after %d attempts: %v", sm.maxRetries, lastErr)
}

// pollForUpdates polls the server for clipboard updates
func (sm *SyncManager) pollForUpdates() {
	sm.lastPollTime = time.Now()
	
	pollResp, err := sm.apiClient.PollForUpdates()
	if err != nil {
		sm.lastError = err
		log.Printf("Failed to poll for updates: %v", err)
		return
	}
	
	sm.lastError = nil
	
	if len(pollResp.Items) == 0 {
		return // No new items
	}
	
	log.Printf("Received %d clipboard updates from server", len(pollResp.Items))
	
	// Process each item
	for _, item := range pollResp.Items {
		if err := sm.handleRemoteClipboardItem(&item); err != nil {
			log.Printf("Failed to handle remote clipboard item (ID: %s): %v", item.ID, err)
		}
	}
}

// handleRemoteClipboardItem processes a remote clipboard item
func (sm *SyncManager) handleRemoteClipboardItem(item *api.ClipboardItem) error {
	// Decrypt content
	decryptedContent, err := sm.apiClient.DecryptClipboardItem(item)
	if err != nil {
		return fmt.Errorf("failed to decrypt content: %w", err)
	}
	
	// Set local clipboard
	content := clipboard.Content{
		Text: decryptedContent,
		Type: item.Type,
	}
	
	if err := sm.clipboardMonitor.SetClipboard(content); err != nil {
		return fmt.Errorf("failed to set local clipboard: %w", err)
	}
	
	sm.itemsReceived++
	log.Printf("Applied remote clipboard item (ID: %s, Type: %s, Size: %d bytes)", 
		item.ID, item.Type, len(decryptedContent))
	
	return nil
}

// GetStats returns synchronization statistics
func (sm *SyncManager) GetStats() SyncStats {
	return SyncStats{
		IsRunning:     sm.isRunning,
		ItemsSynced:   sm.itemsSynced,
		ItemsReceived: sm.itemsReceived,
		LastSyncTime:  sm.lastSyncTime,
		LastPollTime:  sm.lastPollTime,
		LastError:     sm.lastError,
		LastSeq:       sm.apiClient.GetLastSeq(),
	}
}

// SyncStats holds synchronization statistics
type SyncStats struct {
	IsRunning     bool
	ItemsSynced   int64
	ItemsReceived int64
	LastSyncTime  time.Time
	LastPollTime  time.Time
	LastError     error
	LastSeq       int
}

// IsHealthy returns true if the sync manager is running without errors
func (sm *SyncManager) IsHealthy() bool {
	return sm.isRunning && sm.lastError == nil
}

// GetLastError returns the last error encountered
func (sm *SyncManager) GetLastError() error {
	return sm.lastError
}