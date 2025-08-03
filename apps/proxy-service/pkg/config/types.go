// @feature:config-management @domain:config @backend
// @summary: Simplified configuration types for Go agent with mock API client

package config

import "time"

// UserConfig represents the configuration for a user's device
type UserConfig struct {
	DeviceID  string        `json:"device_id"`
	Rules     []RoutingRule `json:"rules"`
	Workers   WorkerConfig  `json:"workers"`
	UpdatedAt time.Time     `json:"updated_at"`
}

// RoutingRule defines how traffic should be routed
type RoutingRule struct {
	ID          string    `json:"id"`
	Domain      string    `json:"domain"`   // "*.facebook.com"
	Action      string    `json:"action"`   // "DIRECT", "PROXY", "BLOCK"
	Region      string    `json:"region"`   // "us-east", "uk-london"
	Priority    int       `json:"priority"` // Higher numbers = higher priority
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// WorkerConfig contains Cloudflare Worker endpoints
type WorkerConfig struct {
	DefaultRegion string            `json:"default_region"`
	Regions       map[string]string `json:"regions"` // region -> worker URL
}

// RouteAction defines the action to take for a domain
type RouteAction string

const (
	ActionDirect RouteAction = "DIRECT"
	ActionProxy  RouteAction = "PROXY"
	ActionBlock  RouteAction = "BLOCK"
)

// AnalyticsData represents usage statistics to report back
type AnalyticsData struct {
	DeviceID      string           `json:"device_id"`
	Timestamp     time.Time        `json:"timestamp"`
	TotalRequests int64            `json:"total_requests"`
	DirectCount   int64            `json:"direct_count"`
	ProxyCount    int64            `json:"proxy_count"`
	BlockedCount  int64            `json:"blocked_count"`
	DomainStats   map[string]int64 `json:"domain_stats"`
}

// DefaultConfig returns a mock configuration for development
func DefaultConfig() *UserConfig {
	return &UserConfig{
		DeviceID: "dev-device-123",
		Rules: []RoutingRule{
			{
				ID:          "gaming-direct-steam",
				Domain:      "*.steampowered.com",
				Action:      "DIRECT",
				Priority:    300,
				Description: "Direct connection for Steam gaming platform",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          "gaming-direct-epic",
				Domain:      "*.epicgames.com",
				Action:      "DIRECT",
				Priority:    300,
				Description: "Direct connection for Epic Games",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          "streaming-direct-netflix",
				Domain:      "*.netflix.com",
				Action:      "DIRECT",
				Priority:    250,
				Description: "Direct connection for Netflix streaming",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          "streaming-direct-youtube",
				Domain:      "*.youtube.com",
				Action:      "DIRECT",
				Priority:    250,
				Description: "Direct connection for YouTube",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          "social-media-proxy-facebook",
				Domain:      "*.facebook.com",
				Action:      "PROXY",
				Region:      "us-east",
				Priority:    200,
				Description: "Route Facebook through proxy for privacy",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          "social-media-proxy-instagram",
				Domain:      "*.instagram.com",
				Action:      "PROXY",
				Region:      "us-east",
				Priority:    200,
				Description: "Route Instagram through proxy for privacy",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
			{
				ID:          "social-media-proxy-twitter",
				Domain:      "*.twitter.com",
				Action:      "PROXY",
				Region:      "us-east",
				Priority:    200,
				Description: "Route Twitter through proxy for privacy",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			},
		},
		Workers: WorkerConfig{
			DefaultRegion: "us-east",
			Regions: map[string]string{
				"us-east":      "us-east.family-proxy.workers.dev",
				"us-west":      "us-west.family-proxy.workers.dev",
				"uk-london":    "uk-london.family-proxy.workers.dev",
				"de-frankfurt": "de-frankfurt.family-proxy.workers.dev",
				"jp-tokyo":     "jp-tokyo.family-proxy.workers.dev",
				"au-sydney":    "au-sydney.family-proxy.workers.dev",
			},
		},
		UpdatedAt: time.Now(),
	}
}
