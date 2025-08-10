// @feature:clipboard-encryption @domain:security @backend
// @summary: Client-side encryption manager for clipboard content using AES-256-GCM

package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"io"

	"golang.org/x/crypto/pbkdf2"
)

const (
	// AES-256 key size
	keySize = 32
	// PBKDF2 iterations for key derivation
	pbkdf2Iterations = 100000
	// Salt size for PBKDF2
	saltSize = 16
	// Nonce size for GCM
	nonceSize = 12
)

// EncryptionManager handles all clipboard content encryption/decryption
type EncryptionManager struct {
	deviceKey []byte
	deviceID  string
	userID    string
	enabled   bool
}

// EncryptedContent represents encrypted clipboard data
type EncryptedContent struct {
	Algorithm   string `json:"algorithm"`
	Ciphertext  string `json:"ciphertext"` // Base64 encoded
	IsEncrypted bool   `json:"isEncrypted"`
}

// NewEncryptionManager creates a new encryption manager for a device
func NewEncryptionManager(deviceID, userID string) *EncryptionManager {
	return &EncryptionManager{
		deviceID: deviceID,
		userID:   userID,
		enabled:  false,
	}
}

// SetupDeviceKey derives and stores the device-specific encryption key from master passphrase
func (e *EncryptionManager) SetupDeviceKey(masterPassphrase string) error {
	if masterPassphrase == "" {
		return errors.New("master passphrase cannot be empty")
	}

	// Derive a user-specific salt so the same passphrase yields the same key across user's devices
	userSaltSource := sha256.Sum256([]byte("ap-user-salt-v2:" + e.userID))
	salt := userSaltSource

	// Derive device key using PBKDF2
	e.deviceKey = pbkdf2.Key(
		[]byte(masterPassphrase),
		salt[:saltSize],
		pbkdf2Iterations,
		keySize,
		sha256.New,
	)

	e.enabled = true
	return nil
}

// IsEnabled returns whether encryption is enabled for this manager
func (e *EncryptionManager) IsEnabled() bool {
	return e.enabled && len(e.deviceKey) == keySize
}

// EncryptContent encrypts plaintext content using AES-256-GCM
func (e *EncryptionManager) EncryptContent(plaintext string) (*EncryptedContent, error) {
	if !e.IsEnabled() {
		return &EncryptedContent{
			Algorithm:   "none",
			Ciphertext:  plaintext,
			IsEncrypted: false,
		}, nil
	}

	if plaintext == "" {
		return nil, errors.New("plaintext cannot be empty")
	}

	// Create AES cipher
	block, err := aes.NewCipher(e.deviceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM cipher mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	// Generate random nonce
	nonce := make([]byte, nonceSize)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	// Encrypt the plaintext
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// Encode as base64 for storage/transmission
	encoded := base64.StdEncoding.EncodeToString(ciphertext)

	return &EncryptedContent{
		Algorithm:   "AES-256-GCM",
		Ciphertext:  encoded,
		IsEncrypted: true,
	}, nil
}

// DecryptContent decrypts encrypted content back to plaintext
func (e *EncryptionManager) DecryptContent(encryptedContent *EncryptedContent) (string, error) {
	if encryptedContent == nil {
		return "", errors.New("encrypted content cannot be nil")
	}

	// Handle unencrypted content
	if !encryptedContent.IsEncrypted || encryptedContent.Algorithm == "none" {
		return encryptedContent.Ciphertext, nil
	}

	// Check if encryption is enabled
	if !e.IsEnabled() {
		return "", errors.New("encryption manager not initialized with device key")
	}

	// Only support AES-256-GCM for now
	if encryptedContent.Algorithm != "AES-256-GCM" {
		return "", fmt.Errorf("unsupported encryption algorithm: %s", encryptedContent.Algorithm)
	}

	// Decode from base64
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedContent.Ciphertext)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	// Minimum size check (nonce + at least 1 byte + tag)
	if len(ciphertext) < nonceSize+1+16 {
		return "", errors.New("ciphertext too short")
	}

	// Create AES cipher
	block, err := aes.NewCipher(e.deviceKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM cipher mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Extract nonce and encrypted data
	nonce := ciphertext[:nonceSize]
	encryptedData := ciphertext[nonceSize:]

	// Decrypt
	plaintext, err := gcm.Open(nil, nonce, encryptedData, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	return string(plaintext), nil
}

// ChangePassphrase updates the device key with a new master passphrase
func (e *EncryptionManager) ChangePassphrase(newMasterPassphrase string) error {
	if newMasterPassphrase == "" {
		return errors.New("new master passphrase cannot be empty")
	}

	return e.SetupDeviceKey(newMasterPassphrase)
}

// GenerateContentHash creates a hash of the encrypted content for deduplication
func (e *EncryptionManager) GenerateContentHash(content *EncryptedContent) string {
	if content == nil {
		return ""
	}

	// Hash the ciphertext for deduplication
	hash := sha256.Sum256([]byte(content.Ciphertext))
	return fmt.Sprintf("%x", hash)
}

// DisableEncryption disables encryption for this manager (for testing/debugging)
func (e *EncryptionManager) DisableEncryption() {
	e.enabled = false
	e.deviceKey = nil
}

// GetAlgorithm returns the encryption algorithm used
func (e *EncryptionManager) GetAlgorithm() string {
	if e.IsEnabled() {
		return "AES-256-GCM"
	}
	return "none"
}

// ValidatePassphrase checks if a passphrase would generate the same device key
func (e *EncryptionManager) ValidatePassphrase(passphrase string) bool {
	if !e.IsEnabled() {
		return false
	}

	// Use the same user-specific salt used in SetupDeviceKey
	salt := sha256.Sum256([]byte("ap-user-salt-v2:" + e.userID))

	// Derive test key
	testKey := pbkdf2.Key(
		[]byte(passphrase),
		salt[:saltSize],
		pbkdf2Iterations,
		keySize,
		sha256.New,
	)

	// Compare with stored key
	if len(testKey) != len(e.deviceKey) {
		return false
	}

	for i := range testKey {
		if testKey[i] != e.deviceKey[i] {
			return false
		}
	}

	return true
}
