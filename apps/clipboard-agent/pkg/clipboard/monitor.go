// @feature:clipboard-monitoring @domain:clipboard @backend
// @summary: Cross-platform clipboard monitor implementation

package clipboard

import (
	"clipboard-agent/pkg/config"
	"context"
	"fmt"
	"log"
	"sync"
	"time"
)

// DefaultMonitor provides a cross-platform clipboard monitoring implementation
type DefaultMonitor struct {
	processor   *ItemProcessor
	callbacks   []func(config.ClipboardItem)
	lastHash    string
	appliedHashes map[string]time.Time // Track self-applied content to prevent echo
	mutex       sync.RWMutex
	running     bool
	stopChan    chan struct{}
}

// NewDefaultMonitor creates a new clipboard monitor
func NewDefaultMonitor(deviceID, userID string) *DefaultMonitor {
	return &DefaultMonitor{
		processor:     NewItemProcessor(deviceID, userID),
		callbacks:     make([]func(config.ClipboardItem), 0),
		appliedHashes: make(map[string]time.Time),
		stopChan:      make(chan struct{}),
	}
}

// Start begins monitoring clipboard changes
func (m *DefaultMonitor) Start(ctx context.Context) error {
	m.mutex.Lock()
	if m.running {
		m.mutex.Unlock()
		return nil
	}
	m.running = true
	m.mutex.Unlock()

	// Start the monitoring loop
	go m.monitorLoop(ctx)
	
	log.Println("Clipboard monitor started")
	return nil
}

// Stop stops monitoring clipboard changes
func (m *DefaultMonitor) Stop() error {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	if !m.running {
		return nil
	}
	
	m.running = false
	close(m.stopChan)
	
	log.Println("Clipboard monitor stopped")
	return nil
}

// OnChange registers a callback for clipboard changes
func (m *DefaultMonitor) OnChange(callback func(item config.ClipboardItem)) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	m.callbacks = append(m.callbacks, callback)
}

// GetCurrent gets the current clipboard content
func (m *DefaultMonitor) GetCurrent() (*config.ClipboardItem, error) {
	// Use platform-specific implementation
	return getCurrentClipboard(m.processor)
}

// WriteText sets text content to clipboard
func (m *DefaultMonitor) WriteText(text string) error {
	item := m.processor.ProcessText(text)
	m.MarkAsApplied(item.ContentHash)
	return writeTextToClipboard(text)
}

// WriteImage sets image content to clipboard
func (m *DefaultMonitor) WriteImage(imageData []byte, format string) error {
	item := m.processor.ProcessImage(imageData, format)
	m.MarkAsApplied(item.ContentHash)
	return writeImageToClipboard(imageData, format)
}

// SetClipboard sets clipboard content from a Content object
func (m *DefaultMonitor) SetClipboard(content Content) error {
	switch content.Type {
	case "text":
		return m.WriteText(content.Text)
	case "image":
		return m.WriteImage(content.ImageData, content.Format)
	default:
		return fmt.Errorf("unsupported content type: %s", content.Type)
	}
}

// MarkAsApplied marks content as self-applied to prevent echo
func (m *DefaultMonitor) MarkAsApplied(contentHash string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	m.appliedHashes[contentHash] = time.Now()
	
	// Clean up old entries (older than 5 minutes)
	cutoff := time.Now().Add(-5 * time.Minute)
	for hash, timestamp := range m.appliedHashes {
		if timestamp.Before(cutoff) {
			delete(m.appliedHashes, hash)
		}
	}
}

// monitorLoop runs the clipboard monitoring loop
func (m *DefaultMonitor) monitorLoop(ctx context.Context) {
	ticker := time.NewTicker(500 * time.Millisecond) // Check every 500ms
	defer ticker.Stop()
	
	for {
		select {
		case <-ctx.Done():
			return
		case <-m.stopChan:
			return
		case <-ticker.C:
			m.checkClipboardChange()
		}
	}
}

// checkClipboardChange checks for clipboard changes and triggers callbacks
func (m *DefaultMonitor) checkClipboardChange() {
	current, err := m.GetCurrent()
	if err != nil {
		log.Printf("Failed to get clipboard content: %v", err)
		return
	}
	
	if current == nil {
		return
	}
	
	m.mutex.RLock()
	lastHash := m.lastHash
	isApplied := m.isHashApplied(current.ContentHash)
	callbacks := make([]func(config.ClipboardItem), len(m.callbacks))
	copy(callbacks, m.callbacks)
	m.mutex.RUnlock()
	
	// Skip if content hasn't changed or if it was self-applied
	if current.ContentHash == lastHash || isApplied {
		return
	}
	
	// Update last hash
	m.mutex.Lock()
	m.lastHash = current.ContentHash
	m.mutex.Unlock()
	
	// Notify all callbacks
	for _, callback := range callbacks {
		go callback(*current)
	}
}

// isHashApplied checks if a content hash was recently applied by this agent
func (m *DefaultMonitor) isHashApplied(contentHash string) bool {
	timestamp, exists := m.appliedHashes[contentHash]
	if !exists {
		return false
	}
	
	// Consider applied if it was set in the last 5 minutes
	return time.Since(timestamp) < 5*time.Minute
}

// NewMonitor creates a new clipboard monitor (interface wrapper)
func NewMonitor() (Manager, error) {
	// For now, use placeholder values - in a real implementation these would be injected
	return NewDefaultMonitor("default-device", "default-user"), nil
}