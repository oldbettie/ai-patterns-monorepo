// @feature:device-management @domain:system @backend
// @summary: Device identity and configuration management

package system

import (
	"clipboard-agent/pkg/config"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// DeviceManager handles device identity and persistent configuration
type DeviceManager struct {
	configPath string
	config     *config.AgentConfig
}

// NewDeviceManager creates a new device manager
func NewDeviceManager(configPath string) *DeviceManager {
	return &DeviceManager{
		configPath: configPath,
	}
}

// LoadOrCreateConfig loads existing config or creates a new one
func (dm *DeviceManager) LoadOrCreateConfig() (*config.AgentConfig, error) {
	// Try to load existing config
	if _, err := os.Stat(dm.configPath); err == nil {
		config, err := dm.loadConfig()
		if err == nil {
			dm.config = config
			return config, nil
		}
		// If loading fails, continue to create new config
	}

	// Create new config
	config, err := dm.createNewConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to create new config: %w", err)
	}

	if err := dm.saveConfig(config); err != nil {
		return nil, fmt.Errorf("failed to save new config: %w", err)
	}

	dm.config = config
	return config, nil
}

// UpdateConfig updates and saves the configuration
func (dm *DeviceManager) UpdateConfig(config *config.AgentConfig) error {
	config.UpdatedAt = time.Now()
	if err := dm.saveConfig(config); err != nil {
		return fmt.Errorf("failed to save config: %w", err)
	}
	dm.config = config
	return nil
}

// GetConfig returns the current configuration
func (dm *DeviceManager) GetConfig() *config.AgentConfig {
	return dm.config
}

// loadConfig loads configuration from disk
func (dm *DeviceManager) loadConfig() (*config.AgentConfig, error) {
	data, err := os.ReadFile(dm.configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config config.AgentConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}

// saveConfig saves configuration to disk
func (dm *DeviceManager) saveConfig(cfg *config.AgentConfig) error {
	// Create directory if it doesn't exist
	dir := filepath.Dir(dm.configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// Write to temporary file first, then rename (atomic operation)
	tempFile := dm.configPath + ".tmp"
	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}

	if err := os.Rename(tempFile, dm.configPath); err != nil {
		return fmt.Errorf("failed to rename temp file: %w", err)
	}

	return nil
}

// createNewConfig creates a new device configuration
func (dm *DeviceManager) createNewConfig() (*config.AgentConfig, error) {
	deviceID, err := generateDeviceID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate device ID: %w", err)
	}

	configDir := filepath.Dir(dm.configPath)
	queuePath := filepath.Join(configDir, "clipboard-queue.json")

	return &config.AgentConfig{
		DeviceID:     deviceID,
		QueuePath:    queuePath,
		MaxItemBytes: 10 * 1024 * 1024, // 10MB
		AllowImages:  true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}, nil
}

// generateDeviceID generates a unique device identifier
func generateDeviceID() (string, error) {
	// Use hostname + random bytes for uniqueness
	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = "unknown"
	}

	// Generate 8 random bytes
	randomBytes := make([]byte, 8)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	randomHex := hex.EncodeToString(randomBytes)
	timestamp := time.Now().Unix()

	return fmt.Sprintf("%s-%s-%d-%s", runtime.GOOS, hostname, timestamp, randomHex), nil
}

// DeviceInfo contains device identification information
type DeviceInfo struct {
	DeviceID string
	Name     string
	Platform string
}

// GetDeviceInfo returns device identification information
func (dm *DeviceManager) GetDeviceInfo() (*DeviceInfo, error) {
	config, err := dm.LoadOrCreateConfig()
	if err != nil {
		return nil, err
	}

	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = "Unknown Device"
	}

	// Use saved device name if available, otherwise use hostname
	deviceName := hostname
	if config.DeviceName != "" {
		deviceName = config.DeviceName
	}

	return &DeviceInfo{
		DeviceID: config.DeviceID,
		Name:     deviceName,
		Platform: runtime.GOOS,
	}, nil
}

// SaveDeviceInfo saves device information to config
func (dm *DeviceManager) SaveDeviceInfo(deviceInfo *DeviceInfo) error {
	config, err := dm.LoadOrCreateConfig()
	if err != nil {
		return err
	}

	config.DeviceName = deviceInfo.Name
	config.UpdatedAt = time.Now()

	return dm.saveConfig(config)
}

// GetDefaultConfigPath returns the default configuration file path for the platform
func GetDefaultConfigPath() string {
	switch runtime.GOOS {
	case "windows":
		appData := os.Getenv("APPDATA")
		if appData == "" {
			appData = os.Getenv("USERPROFILE")
		}
		return filepath.Join(appData, "clipboard-agent", "config.json")
	case "darwin":
		homeDir, _ := os.UserHomeDir()
		return filepath.Join(homeDir, ".config", "clipboard-agent", "config.json")
	default: // Linux and others
		homeDir, _ := os.UserHomeDir()
		return filepath.Join(homeDir, ".config", "clipboard-agent", "config.json")
	}
}