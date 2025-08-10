// @feature:clipboard-monitoring @domain:clipboard @backend
// @summary: Clipboard monitoring and manipulation interfaces and types

package clipboard

import (
	"clipboard-agent/pkg/config"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"time"
)

// Monitor defines the interface for clipboard monitoring
type Monitor interface {
	// Start begins monitoring clipboard changes
	Start(ctx context.Context) error
	
	// Stop stops monitoring clipboard changes
	Stop() error
	
	// OnChange registers a callback for clipboard changes
	OnChange(callback func(item config.ClipboardItem))
	
	// GetCurrent gets the current clipboard content
	GetCurrent() (*config.ClipboardItem, error)
}

// Writer defines the interface for setting clipboard content
type Writer interface {
	// WriteText sets text content to clipboard
	WriteText(text string) error
	
	// WriteImage sets image content to clipboard
	WriteImage(imageData []byte, format string) error
	
	// SetClipboard sets clipboard content from a Content object
	SetClipboard(content Content) error
	
	// MarkAsApplied marks content as self-applied to prevent echo
	MarkAsApplied(contentHash string)
}

// Manager combines monitoring and writing capabilities
type Manager interface {
	Monitor
	Writer
}

// ItemProcessor handles clipboard item processing and normalization
type ItemProcessor struct {
	deviceID string
	userID   string
}

// NewItemProcessor creates a new clipboard item processor
func NewItemProcessor(deviceID, userID string) *ItemProcessor {
	return &ItemProcessor{
		deviceID: deviceID,
		userID:   userID,
	}
}

// ProcessText creates a clipboard item from text content
func (p *ItemProcessor) ProcessText(text string) config.ClipboardItem {
	contentHash := p.calculateHash(text, "text")
	
	return config.ClipboardItem{
		DeviceID:    p.deviceID,
		UserID:      p.userID,
		Type:        string(config.TypeText),
		Mime:        "text/plain",
		Text:        text,
		ContentHash: contentHash,
		SizeBytes:   int64(len(text)),
		CreatedAt:   time.Now(),
	}
}

// ProcessImage creates a clipboard item from image data
func (p *ItemProcessor) ProcessImage(imageData []byte, format string) config.ClipboardItem {
	contentHash := p.calculateHash(string(imageData), "image")
	
	// For now, use base64 encoding (will be replaced with object storage URLs later)
	// imageBase64 := base64.StdEncoding.EncodeToString(imageData)
	
	return config.ClipboardItem{
		DeviceID:    p.deviceID,
		UserID:      p.userID,
		Type:        string(config.TypeImage),
		Mime:        format,
		ImageBase64: "", // Will be populated by caller
		ContentHash: contentHash,
		SizeBytes:   int64(len(imageData)),
		Meta: map[string]string{
			"format": format,
		},
		CreatedAt: time.Now(),
	}
}

// calculateHash generates a SHA-256 hash for clipboard content
func (p *ItemProcessor) calculateHash(content, contentType string) string {
	hasher := sha256.New()
	hasher.Write([]byte(contentType))
	hasher.Write([]byte(content))
	return hex.EncodeToString(hasher.Sum(nil))
}

// IsTextSupported checks if text clipboard operations are supported
func IsTextSupported() bool {
	return true // Text is supported on all platforms
}

// IsImageSupported checks if image clipboard operations are supported
func IsImageSupported() bool {
	// Image support varies by platform, implemented in OS-specific files
	return true // Assume supported for now
}

// Content represents clipboard content
type Content struct {
	Type      string // "text" or "image"
	Text      string // for text content
	ImageData []byte // for image content
	Format    string // MIME type for images
}