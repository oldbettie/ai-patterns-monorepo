// @feature:local-agent @domain:system @backend
// @summary: Main entry point for the Family Privacy Proxy local agent

package main

import (
	"context"
	"family-privacy-proxy/pkg/config"
	"family-privacy-proxy/pkg/proxy"
	"family-privacy-proxy/pkg/router"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

const (
	Version = "1.0.0-dev"
)

func main() {
	// Parse command line flags
	var (
		version  = flag.Bool("version", false, "Show version information")
		apiURL   = flag.String("api", "mock", "API endpoint URL (use 'mock' for development)")
		deviceID = flag.String("device-id", "", "Device ID (auto-generated if not provided)")
		verbose  = flag.Bool("v", false, "Verbose logging")
	)
	flag.Parse()

	if *version {
		fmt.Printf("Family Privacy Proxy Agent v%s\n", Version)
		os.Exit(0)
	}

	// Set up logging
	if *verbose {
		log.SetFlags(log.LstdFlags | log.Lshortfile)
	} else {
		log.SetFlags(log.LstdFlags)
	}

	log.Printf("Starting Family Privacy Proxy Agent v%s", Version)

	// Generate device ID if not provided
	if *deviceID == "" {
		*deviceID = generateDeviceID()
		log.Printf("Generated device ID: %s", *deviceID)
	}

	// Initialize API client
	apiClient := config.NewAPIClient(*apiURL, *deviceID)

	// Fetch initial configuration
	ctx := context.Background()
	userConfig, err := apiClient.FetchConfig(ctx)
	if err != nil {
		log.Fatalf("Failed to fetch configuration: %v", err)
	}
	log.Printf("Loaded configuration for device: %s", userConfig.DeviceID)

	// Initialize traffic router
	trafficRouter := router.NewTrafficRouter(userConfig.Rules, userConfig.Workers)

	// Start configuration polling
	go apiClient.StartPolling(ctx, 30*time.Second) // Poll every 30 seconds

	// Update router when configuration changes
	apiClient.OnConfigChange(func(newConfig *config.UserConfig) {
		log.Println("Configuration updated, reloading routing rules")
		if err := trafficRouter.UpdateRules(newConfig.Rules, newConfig.Workers); err != nil {
			log.Printf("Failed to update routing rules: %v", err)
		}
	})

	// Initialize local proxy server (simplified HTTP proxy for now)
	// TODO: Replace with TUN/TAP interface for system-wide traffic capture
	proxyServer := proxy.NewLocalAgent(trafficRouter, 8081)

	if err := proxyServer.Start(); err != nil {
		log.Fatalf("Failed to start local agent: %v", err)
	}
	log.Printf("Local proxy agent started on localhost:8081")

	// TODO: Set system proxy settings to localhost:8081
	log.Printf("TODO: Configure system proxy settings")

	// Setup graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// Print startup information
	fmt.Printf("\n")
	fmt.Printf("🚀 Family Privacy Proxy Agent v%s is running!\n", Version)
	fmt.Printf("\n")
	fmt.Printf("🔀 Local Proxy:   localhost:8081\n")
	fmt.Printf("📋 Routing Rules: %d configured\n", len(userConfig.Rules))
	fmt.Printf("🌍 Worker Regions: %d available\n", len(userConfig.Workers.Regions))
	fmt.Printf("📱 Device ID:     %s\n", userConfig.DeviceID)
	fmt.Printf("🔄 Config Source: %s\n", *apiURL)
	fmt.Printf("\n")
	fmt.Printf("Press Ctrl+C to stop\n")
	fmt.Printf("\n")

	// Start analytics reporting
	go startAnalyticsReporting(apiClient, trafficRouter, *deviceID)

	// Wait for signal
	<-c
	log.Println("Shutting down...")

	// Graceful shutdown
	if err := proxyServer.Stop(); err != nil {
		log.Printf("Error stopping local agent: %v", err)
	}

	// TODO: Restore original system proxy settings

	log.Println("Shutdown complete")
}

// generateDeviceID creates a unique device identifier
func generateDeviceID() string {
	// Simple device ID generation for development
	// In production, this should be more robust and persistent
	hostname, _ := os.Hostname()
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s-%d", hostname, timestamp)
}

// startAnalyticsReporting periodically sends usage statistics
func startAnalyticsReporting(client *config.APIClient, router *router.TrafficRouter, deviceID string) {
	ticker := time.NewTicker(5 * time.Minute) // Report every 5 minutes
	defer ticker.Stop()

	for range ticker.C {
		stats := router.GetStats()

		analytics := config.AnalyticsData{
			DeviceID:      deviceID,
			Timestamp:     time.Now(),
			TotalRequests: stats.TotalRequests,
			DirectCount:   stats.DirectCount,
			ProxyCount:    stats.ProxyCount,
			BlockedCount:  stats.BlockedCount,
			DomainStats:   stats.DomainStats,
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		if err := client.ReportAnalytics(ctx, analytics); err != nil {
			log.Printf("Failed to report analytics: %v", err)
		}
		cancel()
	}
}
