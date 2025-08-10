// @feature:clipboard-sync @domain:sync @backend
// @summary: Offline queue for clipboard items when network is unavailable

package sync

import (
	"clipboard-agent/pkg/config"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Queue manages offline clipboard items waiting to be synchronized
type Queue struct {
	filePath string
	items    []QueuedItem
	mutex    sync.RWMutex
}

// QueuedItem represents a clipboard item in the offline queue
type QueuedItem struct {
	Item      config.ClipboardItem `json:"item"`
	Attempts  int                  `json:"attempts"`
	QueuedAt  time.Time            `json:"queued_at"`
	LastTry   time.Time            `json:"last_try"`
}

// NewQueue creates a new offline queue
func NewQueue(filePath string) *Queue {
	return &Queue{
		filePath: filePath,
		items:    make([]QueuedItem, 0),
	}
}

// Load reads the queue from disk
func (q *Queue) Load() error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	// Create directory if it doesn't exist
	dir := filepath.Dir(q.filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create queue directory: %w", err)
	}

	// Check if file exists
	if _, err := os.Stat(q.filePath); os.IsNotExist(err) {
		q.items = make([]QueuedItem, 0)
		return nil
	}

	data, err := os.ReadFile(q.filePath)
	if err != nil {
		return fmt.Errorf("failed to read queue file: %w", err)
	}

	if len(data) == 0 {
		q.items = make([]QueuedItem, 0)
		return nil
	}

	if err := json.Unmarshal(data, &q.items); err != nil {
		return fmt.Errorf("failed to unmarshal queue: %w", err)
	}

	return nil
}

// Save writes the queue to disk
func (q *Queue) Save() error {
	q.mutex.RLock()
	data, err := json.MarshalIndent(q.items, "", "  ")
	q.mutex.RUnlock()

	if err != nil {
		return fmt.Errorf("failed to marshal queue: %w", err)
	}

	// Write to temporary file first, then rename (atomic operation)
	tempFile := q.filePath + ".tmp"
	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}

	if err := os.Rename(tempFile, q.filePath); err != nil {
		return fmt.Errorf("failed to rename temp file: %w", err)
	}

	return nil
}

// Add adds an item to the queue
func (q *Queue) Add(item config.ClipboardItem) error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	queuedItem := QueuedItem{
		Item:     item,
		Attempts: 0,
		QueuedAt: time.Now(),
	}

	q.items = append(q.items, queuedItem)
	return q.saveUnlocked()
}

// GetPending returns items that should be retried
func (q *Queue) GetPending(maxAttempts int) []QueuedItem {
	q.mutex.RLock()
	defer q.mutex.RUnlock()

	now := time.Now()
	pending := make([]QueuedItem, 0)

	for _, item := range q.items {
		if item.Attempts >= maxAttempts {
			continue // Too many attempts
		}

		// Use exponential backoff for retry delays
		backoffDelay := time.Duration(1<<uint(item.Attempts)) * time.Minute
		if item.Attempts == 0 || now.Sub(item.LastTry) >= backoffDelay {
			pending = append(pending, item)
		}
	}

	return pending
}

// MarkAttempted marks an item as attempted (increments attempt counter)
func (q *Queue) MarkAttempted(itemID string) error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	now := time.Now()
	for i, item := range q.items {
		if item.Item.ID == itemID {
			q.items[i].Attempts++
			q.items[i].LastTry = now
			return q.saveUnlocked()
		}
	}

	return fmt.Errorf("item not found in queue: %s", itemID)
}

// Remove removes an item from the queue (successful sync)
func (q *Queue) Remove(itemID string) error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	for i, item := range q.items {
		if item.Item.ID == itemID {
			// Remove item by slicing
			q.items = append(q.items[:i], q.items[i+1:]...)
			return q.saveUnlocked()
		}
	}

	return fmt.Errorf("item not found in queue: %s", itemID)
}

// Size returns the number of items in the queue
func (q *Queue) Size() int {
	q.mutex.RLock()
	defer q.mutex.RUnlock()
	return len(q.items)
}

// Clear removes all items from the queue
func (q *Queue) Clear() error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	q.items = make([]QueuedItem, 0)
	return q.saveUnlocked()
}

// CleanupOld removes items older than the specified duration
func (q *Queue) CleanupOld(maxAge time.Duration) error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	cutoff := time.Now().Add(-maxAge)
	filtered := make([]QueuedItem, 0)

	for _, item := range q.items {
		if item.QueuedAt.After(cutoff) {
			filtered = append(filtered, item)
		}
	}

	if len(filtered) != len(q.items) {
		q.items = filtered
		return q.saveUnlocked()
	}

	return nil
}

// saveUnlocked saves the queue without acquiring the lock (internal use)
func (q *Queue) saveUnlocked() error {
	data, err := json.MarshalIndent(q.items, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal queue: %w", err)
	}

	// Write to temporary file first, then rename (atomic operation)
	tempFile := q.filePath + ".tmp"
	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}

	if err := os.Rename(tempFile, q.filePath); err != nil {
		return fmt.Errorf("failed to rename temp file: %w", err)
	}

	return nil
}