// @feature:config-management @domain:config @backend
// @summary: Mock API client for fetching user configuration from web platform

package config

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// APIClient handles communication with the web platform API
type APIClient struct {
	baseURL    string
	deviceID   string
	httpClient *http.Client
	config     *UserConfig
	mutex      sync.RWMutex
	callbacks  []func(*UserConfig)
}

// NewAPIClient creates a new API client
func NewAPIClient(baseURL, deviceID string) *APIClient {
	return &APIClient{
		baseURL:  baseURL,
		deviceID: deviceID,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		callbacks: make([]func(*UserConfig), 0),
	}
}

// FetchConfig fetches the user configuration from the API
func (c *APIClient) FetchConfig(ctx context.Context) (*UserConfig, error) {
	// For now, use mock data. In production, this will make HTTP request
	if c.baseURL == "mock" {
		return c.getMockConfig(), nil
	}

	// Real API call (for future implementation)
	url := fmt.Sprintf("%s/api/config/%s", c.baseURL, c.deviceID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		// Fallback to mock config if API is unavailable
		log.Printf("API unavailable, using mock config: %v", err)
		return c.getMockConfig(), nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("API returned status %d, using mock config", resp.StatusCode)
		return c.getMockConfig(), nil
	}

	var config UserConfig
	if err := json.NewDecoder(resp.Body).Decode(&config); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	c.mutex.Lock()
	c.config = &config
	c.mutex.Unlock()

	return &config, nil
}

// ReportAnalytics sends usage statistics to the web platform
func (c *APIClient) ReportAnalytics(ctx context.Context, data AnalyticsData) error {
	// For now, just log. In production, this will make HTTP POST
	if c.baseURL == "mock" {
		log.Printf("Analytics (mock): Device=%s, Requests=%d, Direct=%d, Proxy=%d, Blocked=%d",
			data.DeviceID, data.TotalRequests, data.DirectCount, data.ProxyCount, data.BlockedCount)
		return nil
	}

	// Real API call (for future implementation)
	url := fmt.Sprintf("%s/api/analytics", c.baseURL)

	// TODO: Implement actual HTTP POST when web platform is ready
	_ = data // Suppress unused variable warning

	req, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		// Don't fail if analytics can't be sent
		log.Printf("Failed to send analytics: %v", err)
		return nil
	}
	defer resp.Body.Close()

	return nil
}

// StartPolling starts polling for configuration updates
func (c *APIClient) StartPolling(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			config, err := c.FetchConfig(ctx)
			if err != nil {
				log.Printf("Failed to fetch config: %v", err)
				continue
			}

			// Check if config has changed
			c.mutex.RLock()
			hasChanged := c.config == nil || c.config.UpdatedAt.Before(config.UpdatedAt)
			c.mutex.RUnlock()

			if hasChanged {
				c.mutex.Lock()
				c.config = config
				c.mutex.Unlock()

				// Notify callbacks
				go c.notifyCallbacks(config)
			}
		}
	}
}

// OnConfigChange registers a callback for configuration changes
func (c *APIClient) OnConfigChange(callback func(*UserConfig)) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.callbacks = append(c.callbacks, callback)
}

// GetCurrentConfig returns the current cached configuration
func (c *APIClient) GetCurrentConfig() *UserConfig {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if c.config == nil {
		return c.getMockConfig()
	}

	return c.config
}

// notifyCallbacks calls all registered callbacks with the new configuration
func (c *APIClient) notifyCallbacks(config *UserConfig) {
	c.mutex.RLock()
	callbacks := make([]func(*UserConfig), len(c.callbacks))
	copy(callbacks, c.callbacks)
	c.mutex.RUnlock()

	for _, callback := range callbacks {
		callback(config)
	}
}

// getMockConfig returns a mock configuration for development/testing
func (c *APIClient) getMockConfig() *UserConfig {
	config := DefaultConfig()
	config.DeviceID = c.deviceID
	return config
}
