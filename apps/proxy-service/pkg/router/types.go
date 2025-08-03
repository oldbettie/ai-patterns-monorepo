// @feature:proxy-routing @domain:traffic @backend
// @summary: Traffic routing types and interfaces for simplified agent

package router

import (
	"family-privacy-proxy/pkg/config"
	"net/http"
)

// Router defines the interface for traffic routing
type Router interface {
	// Route determines how a request should be handled
	Route(req *http.Request) RouteDecision

	// RouteDomain determines how a domain should be handled
	RouteDomain(domain string) RouteDecision

	// UpdateRules updates the routing rules and worker configuration
	UpdateRules(rules []config.RoutingRule, workers config.WorkerConfig) error

	// GetStats returns routing statistics
	GetStats() RoutingStats
}

// RouteDecision represents the routing decision for a request
type RouteDecision struct {
	Action      string
	WorkerURL   string
	Reason      string
	MatchedRule *config.RoutingRule
}

// RoutingStats contains statistics about routing decisions
type RoutingStats struct {
	TotalRequests int64            `json:"total_requests"`
	DirectCount   int64            `json:"direct_count"`
	ProxyCount    int64            `json:"proxy_count"`
	BlockedCount  int64            `json:"blocked_count"`
	DomainStats   map[string]int64 `json:"domain_stats"`
}

// DomainMatcher interface for domain matching strategies
type DomainMatcher interface {
	Match(domain string, pattern string) bool
}

// RuleEngine interface for rule evaluation
type RuleEngine interface {
	EvaluateRules(domain string, rules []config.RoutingRule) *config.RoutingRule
}
