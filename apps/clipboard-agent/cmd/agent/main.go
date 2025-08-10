// @feature:clipboard-agent @domain:system @backend
// @summary: Main entry point for the encrypted clipboard synchronization agent

package main

import (
	"clipboard-agent/pkg/config"
	"clipboard-agent/pkg/encryption"
	"clipboard-agent/pkg/setup"
	"clipboard-agent/pkg/sync"
	"clipboard-agent/pkg/system"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

var (
	Version           = "1.0.0-dev"  // Injected at build time
	BuildTime         = "unknown"    // Injected at build time
	CommitHash        = "unknown"    // Injected at build time
	DefaultServiceURL = "http://localhost:3000" // Injected at build time
)

func main() {
	// Get default API URL from environment or use build-time default
	defaultAPIURL := os.Getenv("CLIPBOARD_SERVICE_URL")
	if defaultAPIURL == "" {
		defaultAPIURL = DefaultServiceURL
	}

	// Parse command line flags
	var (
		version      = flag.Bool("version", false, "Show version information")
		apiURL       = flag.String("api", defaultAPIURL, "API endpoint URL")
		configPath   = flag.String("config", "", "Configuration file path (auto-detected if not provided)")
		verbose      = flag.Bool("v", false, "Verbose logging")
		passphrase   = flag.String("passphrase", "", "Master encryption passphrase (will prompt if not provided)")
		setupMode    = flag.Bool("setup", false, "Run initial device setup")
		testMode     = flag.Bool("test", false, "Test mode - verify setup and connectivity")
		resetAuth    = flag.Bool("reset-auth", false, "Clear stored authentication data and force re-authentication")
	)
	flag.Parse()

	if *version {
		fmt.Printf("Clipboard Agent v%s\n", Version)
		fmt.Printf("Build time: %s\n", BuildTime)
		fmt.Printf("Commit: %s\n", CommitHash)
		fmt.Printf("Default service URL: %s\n", DefaultServiceURL)
		os.Exit(0)
	}

	// Set up logging
	if *verbose {
		log.SetFlags(log.LstdFlags | log.Lshortfile)
	} else {
		log.SetFlags(log.LstdFlags)
	}

	log.Printf("Starting Clipboard Agent v%s", Version)

	// Determine config path
	if *configPath == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			log.Fatalf("Could not determine home directory: %v", err)
		}
		*configPath = filepath.Join(homeDir, ".clipboard-agent", "config.json")
	}

	// Handle reset auth flag
	if *resetAuth {
		fmt.Println("🔄 Clearing stored authentication and device data...")
		if err := config.ClearStoredAuth(*configPath); err != nil {
			log.Printf("Warning: Failed to clear stored auth: %v", err)
		} else {
			fmt.Println("✅ Authentication data cleared")
		}
		
		// Also clear any device state files that might exist
		configDir := filepath.Dir(*configPath)
		deviceInfoPath := filepath.Join(configDir, "device.json")
		if err := os.Remove(deviceInfoPath); err != nil && !os.IsNotExist(err) {
			log.Printf("Warning: Failed to clear device info: %v", err)
		} else if err == nil {
			fmt.Println("✅ Device info cleared")
		}
		
		// Clear encryption state by removing entire config directory and forcing full setup
		fmt.Println("✅ All local state cleared - full setup will be required")
		
		// Force setup mode after clearing auth
		*setupMode = true
	}

	// Declare variables for device configuration
	var deviceInfo *system.DeviceInfo
	var encryptionManager *encryption.EncryptionManager
	var apiKey string

	// Check if we need to run the interactive setup wizard
	if *setupMode || setup.IsSetupRequired(*configPath) {
		if *setupMode {
			fmt.Println("🔧 Running setup mode...")
		} else {
			fmt.Println("🔧 First-time setup required...")
		}

		wizard := setup.NewSetupWizard(*apiURL, *configPath)
		setupResult, err := wizard.Run(context.Background())
		if err != nil {
			log.Fatalf("Setup failed: %v", err)
		}

		// Use setup results
		deviceInfo = setupResult.DeviceInfo
		encryptionManager = setupResult.EncryptionManager
		apiKey = setupResult.APIKey
		*configPath = setupResult.ConfigPath

		log.Printf("Device ID: %s", deviceInfo.DeviceID)
		log.Printf("Device Name: %s", deviceInfo.Name)
		log.Printf("Platform: %s", deviceInfo.Platform)
	} else {
		// Normal startup - load existing configuration
		deviceManager := system.NewDeviceManager(*configPath)
		var err error
		deviceInfo, err = deviceManager.GetDeviceInfo()
		if err != nil {
			log.Fatalf("Failed to get device info: %v", err)
		}

		log.Printf("Device ID: %s", deviceInfo.DeviceID)
		log.Printf("Device Name: %s", deviceInfo.Name)
		log.Printf("Platform: %s", deviceInfo.Platform)

		// Load API key from config file first, then fallback to environment
		if agentConfig, err := config.LoadConfig(*configPath); err == nil && agentConfig.AccessToken != "" {
			apiKey = agentConfig.AccessToken
			log.Println("✅ Using API key from config file")
		} else {
			// Fallback to environment variable
			apiKey = os.Getenv("CLIPBOARD_API_KEY")
			if apiKey == "" {
				log.Fatalf("API key not found in config file or environment. Please run with --setup or set CLIPBOARD_API_KEY")
			}
			log.Println("✅ Using API key from environment variable")
		}

		// Get user ID for encryption manager
		userID, err := getUserID(*apiURL, apiKey)
		if err != nil {
			log.Fatalf("Failed to get user ID: %v", err)
		}

		// Initialize encryption manager with user ID
		encryptionManager = encryption.NewEncryptionManager(deviceInfo.DeviceID, userID)

		// Load or prompt for passphrase if needed
		if !encryptionManager.IsEnabled() {
			if *passphrase == "" {
				fmt.Print("Enter master encryption passphrase: ")
				fmt.Scanln(passphrase)
			}

			if err := encryptionManager.SetupDeviceKey(*passphrase); err != nil {
				log.Fatalf("Failed to setup encryption: %v", err)
			}

			log.Println("🔐 Encryption enabled")
		}
	}

	// Create sync manager configuration
	syncConfig := sync.SyncManagerConfig{
		BaseURL:       *apiURL,
		APIKey:        apiKey,
		DeviceID:      deviceInfo.DeviceID,
		PollInterval:  5 * time.Second,
		RetryInterval: 10 * time.Second,
		MaxRetries:    3,
	}

	// Initialize sync manager
	syncManager, err := sync.NewSyncManager(syncConfig, encryptionManager)
	if err != nil {
		log.Fatalf("Failed to create sync manager: %v", err)
	}

	// Handle test mode
	if *testMode {
		if err := runTestMode(syncManager, encryptionManager); err != nil {
			log.Fatalf("Test failed: %v", err)
		}
		fmt.Println("✅ All tests passed!")
		os.Exit(0)
	}

	// Set up context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Print startup information
	printStartupInfo(deviceInfo, *apiURL, *configPath, encryptionManager)

	// Start sync manager in background
	go func() {
		if err := syncManager.Start(ctx); err != nil && err != context.Canceled {
			log.Printf("Sync manager error: %v", err)
		}
	}()

	// Start stats reporting
	go reportStats(ctx, syncManager)

	// Wait for shutdown signal
	<-sigChan
	log.Println("Shutting down...")

	// Graceful shutdown
	cancel()
	syncManager.Stop()

	// Wait a moment for cleanup
	time.Sleep(1 * time.Second)
	log.Println("Shutdown complete")
}


// runTestMode verifies setup and connectivity
func runTestMode(syncManager *sync.SyncManager, encryptionManager *encryption.EncryptionManager) error {
	fmt.Println("🧪 Running tests...")

	// Test encryption
	fmt.Print("Testing encryption... ")
	testContent := "Hello, encrypted world!"
	encrypted, err := encryptionManager.EncryptContent(testContent)
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	decrypted, err := encryptionManager.DecryptContent(encrypted)
	if err != nil {
		return fmt.Errorf("decryption failed: %w", err)
	}

	if decrypted != testContent {
		return fmt.Errorf("encryption/decryption mismatch")
	}
	fmt.Println("✅")

	// Test sync manager health
	fmt.Print("Testing sync manager... ")
	if !syncManager.IsHealthy() {
		if err := syncManager.GetLastError(); err != nil {
			return fmt.Errorf("sync manager error: %w", err)
		}
		return fmt.Errorf("sync manager not healthy")
	}
	fmt.Println("✅")

	return nil
}

// printStartupInfo displays startup information
func printStartupInfo(deviceInfo *system.DeviceInfo, apiURL, configPath string, encryptionManager *encryption.EncryptionManager) {
	fmt.Printf("\n")
	fmt.Printf("📋 Encrypted Clipboard Agent v%s is running!\n", Version)
	fmt.Printf("\n")
	fmt.Printf("🖥️  Device ID:       %s\n", deviceInfo.DeviceID)
	fmt.Printf("💻 Device Name:     %s\n", deviceInfo.Name)
	fmt.Printf("🖼️  Platform:        %s\n", deviceInfo.Platform)
	fmt.Printf("🌐 API Endpoint:    %s\n", apiURL)
	fmt.Printf("📁 Config Path:     %s\n", configPath)
	fmt.Printf("🔐 Encryption:      %s\n", encryptionManager.GetAlgorithm())
	fmt.Printf("⚡ Poll Interval:   5 seconds\n")
	fmt.Printf("\n")
	fmt.Printf("Press Ctrl+C to stop\n")
	fmt.Printf("\n")
}

// reportStats periodically reports sync statistics
func reportStats(ctx context.Context, syncManager *sync.SyncManager) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			stats := syncManager.GetStats()
			if stats.ItemsSynced > 0 || stats.ItemsReceived > 0 {
				log.Printf("Stats - Synced: %d, Received: %d, Last Poll: %s, Healthy: %t",
					stats.ItemsSynced,
					stats.ItemsReceived,
					stats.LastPollTime.Format("15:04:05"),
					syncManager.IsHealthy())
			}
		}
	}
}

// UserInfoResponse represents the API response structure
type UserInfoResponse struct {
	Data  *UserInfoData `json:"data"`
	Error *string       `json:"error"`
}

type UserInfoData struct {
	User *UserInfo `json:"user"`
}

type UserInfo struct {
	ID string `json:"id"`
}

// getUserID fetches the user ID associated with the API key
func getUserID(apiURL, apiKey string) (string, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	// Make request to get user info
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/core/v1/users", apiURL), nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("User-Agent", "clipboard-agent/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	// Parse the JSON response
	var userResp UserInfoResponse
	if err := json.NewDecoder(resp.Body).Decode(&userResp); err != nil {
		return "", fmt.Errorf("failed to parse user response: %w", err)
	}

	if userResp.Error != nil {
		return "", fmt.Errorf("user API error: %s", *userResp.Error)
	}

	if userResp.Data == nil || userResp.Data.User == nil {
		return "", fmt.Errorf("no user data in response")
	}

	return userResp.Data.User.ID, nil
}