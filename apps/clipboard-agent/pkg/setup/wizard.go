// @feature:clipboard-agent @domain:setup @backend
// @summary: Interactive setup wizard for clipboard agent with Better Auth integration

package setup

import (
	"clipboard-agent/pkg/config"
	"clipboard-agent/pkg/encryption"
	"clipboard-agent/pkg/system"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/AlecAivazis/survey/v2"
	"github.com/AlecAivazis/survey/v2/terminal"
)

type SetupWizard struct {
	apiURL            string
	configPath        string
	deviceManager     *system.DeviceManager
	registrationToken string // Store the token to reuse across polling
}

type SetupResult struct {
	DeviceInfo        *system.DeviceInfo
	EncryptionManager *encryption.EncryptionManager
	APIKey            string
	ConfigPath        string
}

type DeviceRegistrationResponse struct {
	Data  *DeviceRegistrationData `json:"data"`
	Error *string                 `json:"error"`
}

type DeviceRegistrationData struct {
	APIKey    string `json:"apiKey"`
	DeviceID  string `json:"deviceId"`
	ExpiresAt *int64 `json:"expiresAt"`
}

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

// NewSetupWizard creates a new setup wizard
func NewSetupWizard(apiURL, configPath string) *SetupWizard {
	return &SetupWizard{
		apiURL:        apiURL,
		configPath:    configPath,
		deviceManager: system.NewDeviceManager(configPath),
	}
}

// Run executes the interactive setup wizard
func (w *SetupWizard) Run(ctx context.Context) (*SetupResult, error) {
	// Welcome screen
	if err := w.showWelcome(); err != nil {
		return nil, fmt.Errorf("welcome screen failed: %w", err)
	}

	// Device configuration
	deviceInfo, err := w.configureDevice()
	if err != nil {
		return nil, fmt.Errorf("device configuration failed: %w", err)
	}

	// Service connection
	apiURL, err := w.configureService()
	if err != nil {
		return nil, fmt.Errorf("service configuration failed: %w", err)
	}
	w.apiURL = apiURL

	// Account authentication & device registration
	apiKey, err := w.authenticateAndRegister(ctx, deviceInfo)
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	// Get user ID for encryption
	userID, err := w.getUserID(apiKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	// Encryption setup (after getting user ID)
	encryptionManager, err := w.setupEncryption(deviceInfo.DeviceID, userID)
	if err != nil {
		return nil, fmt.Errorf("encryption setup failed: %w", err)
	}

	// Final steps
	if err := w.finalizeSetup(deviceInfo, apiKey); err != nil {
		return nil, fmt.Errorf("setup finalization failed: %w", err)
	}

	return &SetupResult{
		DeviceInfo:        deviceInfo,
		EncryptionManager: encryptionManager,
		APIKey:            apiKey,
		ConfigPath:        w.configPath,
	}, nil
}

// showWelcome displays the welcome screen
func (w *SetupWizard) showWelcome() error {
	fmt.Println()
	fmt.Println("🎉 Welcome to Encrypted Clipboard Sync!")
	fmt.Println()
	fmt.Println("This wizard will help you set up secure clipboard synchronization")
	fmt.Println("across all your devices. Your clipboard data will be encrypted")
	fmt.Println("end-to-end and never stored unencrypted on our servers.")
	fmt.Println()
	fmt.Println("What this app does:")
	fmt.Println("• 📋 Monitors your clipboard for changes")
	fmt.Println("• 🔐 Encrypts clipboard content with your master passphrase")
	fmt.Println("• 🌐 Syncs encrypted data across your devices")
	fmt.Println("• ⚡ Provides real-time synchronization")
	fmt.Println()

	var proceed bool
	prompt := &survey.Confirm{
		Message: "Ready to get started?",
		Default: true,
	}

	if err := survey.AskOne(prompt, &proceed); err != nil {
		if err == terminal.InterruptErr {
			return fmt.Errorf("setup cancelled by user")
		}
		return err
	}

	if !proceed {
		return fmt.Errorf("setup cancelled by user")
	}

	return nil
}

// configureDevice handles device configuration
func (w *SetupWizard) configureDevice() (*system.DeviceInfo, error) {
	fmt.Println()
	fmt.Println("🖥️  Device Configuration")
	fmt.Println("════════════════════════")

	// Get or create device info
	deviceInfo, err := w.deviceManager.GetDeviceInfo()
	if err != nil {
		return nil, err
	}

	fmt.Printf("Device ID: %s\n", deviceInfo.DeviceID)
	fmt.Printf("Platform: %s\n", deviceInfo.Platform)
	fmt.Println()

	// Allow user to customize device name
	var deviceName string
	prompt := &survey.Input{
		Message: "Device Name:",
		Default: deviceInfo.Name,
		Help:    "This name will appear in your dashboard to identify this device",
	}

	if err := survey.AskOne(prompt, &deviceName); err != nil {
		return nil, err
	}

	deviceInfo.Name = strings.TrimSpace(deviceName)

	// Save updated device info
	if err := w.deviceManager.SaveDeviceInfo(deviceInfo); err != nil {
		return nil, fmt.Errorf("failed to save device info: %w", err)
	}

	fmt.Printf("✅ Device configured as: %s\n", deviceInfo.Name)
	return deviceInfo, nil
}

// setupEncryption handles encryption configuration
func (w *SetupWizard) setupEncryption(deviceID, userID string) (*encryption.EncryptionManager, error) {
	fmt.Println()
	fmt.Println("🔐 Encryption Setup")
	fmt.Println("═══════════════════")

	encryptionManager := encryption.NewEncryptionManager(deviceID, userID)

	// During setup mode, always configure encryption (don't check if already enabled)
	// This ensures fresh setup with new salt version

	fmt.Println("Create a master passphrase to encrypt your clipboard data.")
	fmt.Println("This passphrase will be required on all your devices.")
	fmt.Println("⚠️  Important: We cannot recover this passphrase if you lose it!")
	fmt.Println()

	var passphrase string
	var confirmPassphrase string

	// Get passphrase
	passphrasePrompt := &survey.Password{
		Message: "Master Passphrase:",
		Help:    "Use a strong passphrase - this protects all your clipboard data",
	}

	if err := survey.AskOne(passphrasePrompt, &passphrase); err != nil {
		return nil, err
	}

	// Confirm passphrase
	confirmPrompt := &survey.Password{
		Message: "Confirm Passphrase:",
	}

	if err := survey.AskOne(confirmPrompt, &confirmPassphrase); err != nil {
		return nil, err
	}

	if passphrase != confirmPassphrase {
		return nil, fmt.Errorf("passphrases do not match")
	}

	if len(passphrase) < 8 {
		return nil, fmt.Errorf("passphrase must be at least 8 characters long")
	}

	// Setup encryption
	if err := encryptionManager.SetupDeviceKey(passphrase); err != nil {
		return nil, fmt.Errorf("failed to setup encryption: %w", err)
	}

	fmt.Println("✅ Encryption configured successfully")
	return encryptionManager, nil
}

// configureService handles service endpoint configuration
func (w *SetupWizard) configureService() (string, error) {
	fmt.Println()
	fmt.Println("🌐 Service Configuration")
	fmt.Println("════════════════════════")

	// First, let's test if the default endpoint is accessible
	fmt.Printf("Testing connection to %s...\n", w.apiURL)
	if err := w.testEndpoint(w.apiURL); err != nil {
		fmt.Printf("❌ Cannot connect to %s\n", w.apiURL)
		fmt.Printf("Error: %v\n", err)
		fmt.Println()
		fmt.Println("💡 Common solutions:")
		fmt.Println("   • If running on Tailscale, try your machine name (e.g., localhost:3000)")
		fmt.Println("   • If running remotely, try the external IP or domain")
		fmt.Println("   • Make sure the web dashboard is running")
		fmt.Println()

		// Force custom endpoint entry
		return w.promptForCustomEndpoint()
	}

	fmt.Printf("✅ Connection successful to %s\n", w.apiURL)

	var useDefault bool
	defaultPrompt := &survey.Confirm{
		Message: fmt.Sprintf("Use this service endpoint (%s)?", w.apiURL),
		Default: true,
		Help:    "The endpoint is working correctly",
	}

	if err := survey.AskOne(defaultPrompt, &useDefault); err != nil {
		return "", err
	}

	if useDefault {
		return w.apiURL, nil
	}

	return w.promptForCustomEndpoint()
}

// promptForCustomEndpoint prompts user for a custom endpoint
func (w *SetupWizard) promptForCustomEndpoint() (string, error) {
	var customURL string

	// Extract hostname from current API URL to use as a smart default
	defaultHost := "localhost:3000"
	if parsedURL, err := url.Parse(w.apiURL); err == nil && parsedURL.Host != "" {
		defaultHost = parsedURL.Host
	}

	for {
		customPrompt := &survey.Input{
			Message: "Enter Service Endpoint:",
			Default: defaultHost,
			Help:    "Examples: localhost:3000, 192.168.1.100:3000, https://clipboard.example.com",
		}

		if err := survey.AskOne(customPrompt, &customURL); err != nil {
			return "", err
		}

		// Add http:// if no protocol specified
		if !strings.HasPrefix(customURL, "http://") && !strings.HasPrefix(customURL, "https://") {
			customURL = "http://" + customURL
		}

		// Validate URL
		if _, err := url.Parse(customURL); err != nil {
			fmt.Printf("❌ Invalid URL format: %v\n", err)
			continue
		}

		// Test the endpoint
		fmt.Printf("Testing connection to %s...\n", customURL)
		if err := w.testEndpoint(customURL); err != nil {
			fmt.Printf("❌ Cannot connect to %s\n", customURL)
			fmt.Printf("Error: %v\n", err)

			var retry bool
			retryPrompt := &survey.Confirm{
				Message: "Try a different endpoint?",
				Default: true,
			}

			if err := survey.AskOne(retryPrompt, &retry); err != nil {
				return "", err
			}

			if !retry {
				return "", fmt.Errorf("cannot connect to service endpoint")
			}
			continue
		}

		fmt.Printf("✅ Using service endpoint: %s\n", customURL)
		return customURL, nil
	}
}

// testEndpoint tests if an endpoint is accessible
func (w *SetupWizard) testEndpoint(endpoint string) error {
	client := &http.Client{Timeout: 5 * time.Second}

	// Try to connect to the root endpoint
	resp, err := client.Get(endpoint)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Accept any response that shows the server is running
	if resp.StatusCode >= 200 && resp.StatusCode < 500 {
		return nil
	}

	return fmt.Errorf("server returned status %d", resp.StatusCode)
}

// authenticateAndRegister handles web authentication and device registration
func (w *SetupWizard) authenticateAndRegister(ctx context.Context, deviceInfo *system.DeviceInfo) (string, error) {
	fmt.Println()
	fmt.Println("🔑 Account Authentication")
	fmt.Println("═════════════════════════")

	fmt.Println("We'll open your web browser to authenticate with your account.")
	fmt.Println("If you don't have an account yet, you can create one there.")
	fmt.Println()

	var proceed bool
	prompt := &survey.Confirm{
		Message: "Open browser for authentication?",
		Default: true,
	}

	if err := survey.AskOne(prompt, &proceed); err != nil {
		return "", err
	}

	if !proceed {
		return "", fmt.Errorf("authentication cancelled by user")
	}

	// Generate device registration token (only once)
	if w.registrationToken == "" {
		registrationToken, err := w.generateRegistrationToken(deviceInfo)
		if err != nil {
			return "", fmt.Errorf("failed to generate registration token: %w", err)
		}
		w.registrationToken = registrationToken
	}

	// Open browser
	authURL := fmt.Sprintf("%s/setup?device_token=%s", w.apiURL, w.registrationToken)
	if err := w.openBrowser(authURL); err != nil {
		fmt.Printf("❌ Could not open browser automatically.\n")
		fmt.Printf("Please manually visit: %s\n", authURL)
	} else {
		fmt.Println("✅ Browser opened for authentication")
	}

	fmt.Println()
	fmt.Println("Complete the authentication in your browser, then return here.")
	fmt.Println("Waiting for authentication to complete...")

	// Poll for completion
	apiKey, err := w.pollForCompletion(ctx, w.registrationToken)
	if err != nil {
		return "", fmt.Errorf("authentication polling failed: %w", err)
	}

	fmt.Println("✅ Authentication complete!")
	return apiKey, nil
}

// generateRegistrationToken creates a temporary token for device registration
func (w *SetupWizard) generateRegistrationToken(deviceInfo *system.DeviceInfo) (string, error) {
	// This would normally make an API call to generate a token
	// For now, we'll create a simple token based on device info
	timestamp := time.Now().Unix()
	return fmt.Sprintf("dev_%s_%d", deviceInfo.DeviceID[:8], timestamp), nil
}

// openBrowser opens the default web browser to the specified URL
func (w *SetupWizard) openBrowser(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
		args = []string{url}
	}

	return exec.Command(cmd, args...).Start()
}

// pollForCompletion waits for authentication to complete
func (w *SetupWizard) pollForCompletion(ctx context.Context, token string) (string, error) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	timeout := time.After(5 * time.Minute)

	for {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-timeout:
			return "", fmt.Errorf("authentication timeout - please try again")
		case <-ticker.C:
			// Check if authentication completed
			apiKey, err := w.checkAuthCompletion(token)
			if err != nil {
				continue // Keep polling
			}
			return apiKey, nil
		}
	}
}

// checkAuthCompletion checks if the authentication process has completed
func (w *SetupWizard) checkAuthCompletion(token string) (string, error) {
	// Get device info to send with registration
	deviceInfo, err := w.deviceManager.GetDeviceInfo()
	if err != nil {
		return "", fmt.Errorf("failed to get device info: %w", err)
	}

	// Prepare registration payload
	registrationData := map[string]interface{}{
		"token":    token,
		"deviceId": deviceInfo.DeviceID,
		"name":     deviceInfo.Name,
		"platform": deviceInfo.Platform,
	}

	payloadBytes, err := json.Marshal(registrationData)
	if err != nil {
		return "", fmt.Errorf("failed to marshal registration data: %w", err)
	}

	// Send POST request to register device
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(
		fmt.Sprintf("%s/api/core/v1/devices/register", w.apiURL),
		"application/json",
		strings.NewReader(string(payloadBytes)),
	)
	if err != nil {
		return "", err // Continue polling
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("auth not complete") // Continue polling
	}

	// Parse the JSON response
	var registrationResp DeviceRegistrationResponse
	if err := json.NewDecoder(resp.Body).Decode(&registrationResp); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if registrationResp.Error != nil {
		return "", fmt.Errorf("registration error: %s", *registrationResp.Error)
	}

	if registrationResp.Data == nil {
		return "", fmt.Errorf("no data in response")
	}

	return registrationResp.Data.APIKey, nil
}

// finalizeSetup completes the setup process
func (w *SetupWizard) finalizeSetup(deviceInfo *system.DeviceInfo, apiKey string) error {
	fmt.Println()
	fmt.Println("🎯 Finalizing Setup")
	fmt.Println("═══════════════════")

	// Create config directory if needed
	configDir := filepath.Dir(w.configPath)
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// Test connection
	fmt.Println("Testing connection...")
	if err := w.testConnection(apiKey); err != nil {
		return fmt.Errorf("connection test failed: %w", err)
	}
	fmt.Println("✅ Connection successful")

	// Save API key securely (in real implementation, use secure storage)
	if err := w.saveAPIKey(apiKey); err != nil {
		return fmt.Errorf("failed to save API key: %w", err)
	}

	fmt.Println()
	fmt.Println("🎉 Setup Complete!")
	fmt.Println("═════════════════")
	fmt.Printf("Device: %s (%s)\n", deviceInfo.Name, deviceInfo.Platform)
	fmt.Printf("Service: %s\n", w.apiURL)
	fmt.Println("Encryption: Enabled")
	fmt.Println()
	fmt.Println("Your clipboard agent is now ready to sync across devices!")
	fmt.Println("Starting clipboard monitoring...")

	return nil
}

// testConnection verifies the API connection
func (w *SetupWizard) testConnection(apiKey string) error {
	client := &http.Client{Timeout: 10 * time.Second}

	// Use desktop API key authenticated endpoint for connection test
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/core/v1/clipboard/sync?since=0&limit=1", w.apiURL), nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("User-Agent", "clipboard-agent/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	return nil
}

// saveAPIKey saves the API key and other auth data to config file
func (w *SetupWizard) saveAPIKey(apiKey string) error {
	// Get device info to include in config
	deviceInfo, err := w.deviceManager.GetDeviceInfo()
	if err != nil {
		return fmt.Errorf("failed to get device info: %w", err)
	}

	// Create config with auth data and device info
	agentConfig := &config.AgentConfig{
		DeviceID:     deviceInfo.DeviceID,
		DeviceName:   deviceInfo.Name,
		AccessToken:  apiKey, // Store API key in AccessToken field
		QueuePath:    filepath.Join(filepath.Dir(w.configPath), "clipboard-queue.db"),
		MaxItemBytes: 10 * 1024 * 1024, // 10MB
		AllowImages:  true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Save config to file
	if err := config.SaveConfig(agentConfig, w.configPath); err != nil {
		return fmt.Errorf("failed to save config: %w", err)
	}

	fmt.Println("✅ Configuration saved to:", w.configPath)
	fmt.Println("💡 Your API key is now stored securely in the config file")
	fmt.Println("   No need to set environment variables manually")

	return nil
}

// IsSetupRequired checks if setup is needed
func IsSetupRequired(configPath string) bool {
	// Check if config exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return true
	}

	// Check if API key is available in config file or environment
	hasStoredAuth := config.HasStoredAuth(configPath)
	hasEnvAuth := os.Getenv("CLIPBOARD_API_KEY") != ""

	if !hasStoredAuth && !hasEnvAuth {
		return true
	}

	// Check if encryption is configured
	deviceManager := system.NewDeviceManager(configPath)
	deviceInfo, err := deviceManager.GetDeviceInfo()
	if err != nil {
		return true
	}

	encryptionManager := encryption.NewEncryptionManager(deviceInfo.DeviceID, "temp-user-id")
	if !encryptionManager.IsEnabled() {
		return true
	}

	return false
}

// getUserID fetches the user ID associated with the API key
func (w *SetupWizard) getUserID(apiKey string) (string, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	// Make request to get user info
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/core/v1/users", w.apiURL), nil)
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
