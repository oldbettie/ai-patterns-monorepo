// @feature:clipboard-encryption @domain:security @backend  
// @summary: Tests for clipboard encryption manager

package encryption

import (
	"testing"
)

func TestEncryptionManager_SetupDeviceKey(t *testing.T) {
	manager := NewEncryptionManager("test-device-123", "user-123")
	
	err := manager.SetupDeviceKey("test-passphrase-123")
	if err != nil {
		t.Fatalf("Failed to setup device key: %v", err)
	}
	
	if !manager.IsEnabled() {
		t.Error("Manager should be enabled after setting up device key")
	}
	
	if len(manager.deviceKey) != keySize {
		t.Errorf("Expected device key size %d, got %d", keySize, len(manager.deviceKey))
	}
}

func TestEncryptionManager_EncryptDecrypt(t *testing.T) {
	manager := NewEncryptionManager("test-device-123", "user-123")
	err := manager.SetupDeviceKey("test-passphrase-123")
	if err != nil {
		t.Fatalf("Failed to setup device key: %v", err)
	}
	
	testCases := []string{
		"Hello, World!",
		"This is a longer test string with special characters: !@#$%^&*()_+-=[]{}|;':\",./<>?",
		"🌟 Unicode test with emojis 🚀",
		"",  // Empty string should be handled
	}
	
	for i, plaintext := range testCases {
		if plaintext == "" {
			// Empty string should return error
			_, err := manager.EncryptContent(plaintext)
			if err == nil {
				t.Error("Expected error for empty string")
			}
			continue
		}
		
		// Encrypt
		encrypted, err := manager.EncryptContent(plaintext)
		if err != nil {
			t.Errorf("Test case %d: Failed to encrypt: %v", i, err)
			continue
		}
		
		if !encrypted.IsEncrypted {
			t.Errorf("Test case %d: Content should be marked as encrypted", i)
		}
		
		if encrypted.Algorithm != "AES-256-GCM" {
			t.Errorf("Test case %d: Expected algorithm AES-256-GCM, got %s", i, encrypted.Algorithm)
		}
		
		// Decrypt
		decrypted, err := manager.DecryptContent(encrypted)
		if err != nil {
			t.Errorf("Test case %d: Failed to decrypt: %v", i, err)
			continue
		}
		
		if decrypted != plaintext {
			t.Errorf("Test case %d: Decrypted text doesn't match original. Expected '%s', got '%s'", i, plaintext, decrypted)
		}
	}
}

func TestEncryptionManager_DifferentKeys(t *testing.T) {
	// Create two managers with different passphrases
	manager1 := NewEncryptionManager("test-device-123", "user-123")
	manager2 := NewEncryptionManager("test-device-456", "user-456")
	
	err1 := manager1.SetupDeviceKey("passphrase-1")
	if err1 != nil {
		t.Fatalf("Failed to setup manager1: %v", err1)
	}
	
	err2 := manager2.SetupDeviceKey("passphrase-2")
	if err2 != nil {
		t.Fatalf("Failed to setup manager2: %v", err2)
	}
	
	plaintext := "Secret message"
	
	// Encrypt with manager1
	encrypted, err := manager1.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt with manager1: %v", err)
	}
	
	// Try to decrypt with manager2 (should fail)
	_, err = manager2.DecryptContent(encrypted)
	if err == nil {
		t.Error("Expected decryption to fail with different key")
	}
}

func TestEncryptionManager_SameUserDifferentDevices(t *testing.T) {
	// Create two managers with same user and passphrase but different device IDs
	manager1 := NewEncryptionManager("device-1", "user-123")
	manager2 := NewEncryptionManager("device-2", "user-123")
	
	passphrase := "same-passphrase"
	
	err1 := manager1.SetupDeviceKey(passphrase)
	if err1 != nil {
		t.Fatalf("Failed to setup manager1: %v", err1)
	}
	
	err2 := manager2.SetupDeviceKey(passphrase)
	if err2 != nil {
		t.Fatalf("Failed to setup manager2: %v", err2)
	}
	
	// Keys should be the same due to user-specific salt (same user)
	if string(manager1.deviceKey) != string(manager2.deviceKey) {
		t.Error("Device keys should be the same for same user ID")
	}
	
	plaintext := "Secret message"
	
	// Encrypt with manager1
	encrypted, err := manager1.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt with manager1: %v", err)
	}
	
	// Should be able to decrypt with manager2 (same user)
	decrypted, err := manager2.DecryptContent(encrypted)
	if err != nil {
		t.Fatalf("Should be able to decrypt with same user key: %v", err)
	}
	
	if decrypted != plaintext {
		t.Error("Decrypted content should match original")
	}
}

func TestEncryptionManager_DifferentUsers(t *testing.T) {
	// Create two managers with same passphrase but different user IDs
	manager1 := NewEncryptionManager("device-1", "user-1")
	manager2 := NewEncryptionManager("device-2", "user-2")
	
	passphrase := "same-passphrase"
	
	err1 := manager1.SetupDeviceKey(passphrase)
	if err1 != nil {
		t.Fatalf("Failed to setup manager1: %v", err1)
	}
	
	err2 := manager2.SetupDeviceKey(passphrase)
	if err2 != nil {
		t.Fatalf("Failed to setup manager2: %v", err2)
	}
	
	// Keys should be different due to user-specific salt
	if string(manager1.deviceKey) == string(manager2.deviceKey) {
		t.Error("Device keys should be different for different user IDs")
	}
	
	plaintext := "Secret message"
	
	// Encrypt with manager1
	encrypted, err := manager1.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt with manager1: %v", err)
	}
	
	// Try to decrypt with manager2 (should fail due to different user-derived keys)
	_, err = manager2.DecryptContent(encrypted)
	if err == nil {
		t.Error("Expected decryption to fail with different user key")
	}
}

func TestEncryptionManager_UnencryptedContent(t *testing.T) {
	manager := NewEncryptionManager("test-device-123", "user-123")
	// Don't set up encryption key
	
	plaintext := "Unencrypted message"
	
	// Should return unencrypted content
	encrypted, err := manager.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to handle unencrypted content: %v", err)
	}
	
	if encrypted.IsEncrypted {
		t.Error("Content should not be marked as encrypted")
	}
	
	if encrypted.Algorithm != "none" {
		t.Errorf("Expected algorithm 'none', got %s", encrypted.Algorithm)
	}
	
	if encrypted.Ciphertext != plaintext {
		t.Error("Unencrypted content should match original plaintext")
	}
	
	// Decrypting unencrypted content should work
	decrypted, err := manager.DecryptContent(encrypted)
	if err != nil {
		t.Fatalf("Failed to decrypt unencrypted content: %v", err)
	}
	
	if decrypted != plaintext {
		t.Error("Decrypted unencrypted content should match original")
	}
}

func TestEncryptionManager_ValidatePassphrase(t *testing.T) {
	manager := NewEncryptionManager("test-device-123", "user-123")
	passphrase := "test-passphrase-123"
	
	err := manager.SetupDeviceKey(passphrase)
	if err != nil {
		t.Fatalf("Failed to setup device key: %v", err)
	}
	
	// Correct passphrase should validate
	if !manager.ValidatePassphrase(passphrase) {
		t.Error("Correct passphrase should validate")
	}
	
	// Incorrect passphrase should not validate
	if manager.ValidatePassphrase("wrong-passphrase") {
		t.Error("Incorrect passphrase should not validate")
	}
	
	// Empty passphrase should not validate
	if manager.ValidatePassphrase("") {
		t.Error("Empty passphrase should not validate")
	}
}

func TestEncryptionManager_ChangePassphrase(t *testing.T) {
	manager := NewEncryptionManager("test-device-123", "user-123")
	
	// Set initial passphrase
	err := manager.SetupDeviceKey("initial-passphrase")
	if err != nil {
		t.Fatalf("Failed to setup initial passphrase: %v", err)
	}
	
	// Encrypt some content with initial key
	plaintext := "Test message"
	encrypted, err := manager.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt with initial key: %v", err)
	}
	
	// Store old key for comparison
	oldKey := make([]byte, len(manager.deviceKey))
	copy(oldKey, manager.deviceKey)
	
	// Change passphrase
	err = manager.ChangePassphrase("new-passphrase")
	if err != nil {
		t.Fatalf("Failed to change passphrase: %v", err)
	}
	
	// Key should be different
	if string(oldKey) == string(manager.deviceKey) {
		t.Error("Device key should change when passphrase changes")
	}
	
	// Should not be able to decrypt old content with new key
	_, err = manager.DecryptContent(encrypted)
	if err == nil {
		t.Error("Should not be able to decrypt old content with new passphrase")
	}
	
	// Should be able to encrypt/decrypt new content
	newEncrypted, err := manager.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt with new key: %v", err)
	}
	
	decrypted, err := manager.DecryptContent(newEncrypted)
	if err != nil {
		t.Fatalf("Failed to decrypt with new key: %v", err)
	}
	
	if decrypted != plaintext {
		t.Error("New encryption/decryption should work correctly")
	}
}

func TestEncryptionManager_GenerateContentHash(t *testing.T) {
	manager := NewEncryptionManager("test-device-123", "user-123")
	err := manager.SetupDeviceKey("test-passphrase")
	if err != nil {
		t.Fatalf("Failed to setup device key: %v", err)
	}
	
	plaintext := "Test message for hashing"
	
	encrypted, err := manager.EncryptContent(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt: %v", err)
	}
	
	hash1 := manager.GenerateContentHash(encrypted)
	if hash1 == "" {
		t.Error("Hash should not be empty")
	}
	
	// Generate hash again - should be the same
	hash2 := manager.GenerateContentHash(encrypted)
	if hash1 != hash2 {
		t.Error("Hash should be consistent for same content")
	}
	
	// Different content should produce different hash
	encrypted2, err := manager.EncryptContent("Different message")
	if err != nil {
		t.Fatalf("Failed to encrypt second message: %v", err)
	}
	
	hash3 := manager.GenerateContentHash(encrypted2)
	if hash1 == hash3 {
		t.Error("Different content should produce different hashes")
	}
}