// @feature:proxy-routing @domain:traffic @backend
// @summary: Traffic routing engine for simplified agent

package router

import (
	"family-privacy-proxy/pkg/config"
	"net/http"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
)

// TrafficRouter implements the Router interface for simplified agent
type TrafficRouter struct {
	rules   []config.RoutingRule
	workers config.WorkerConfig
	stats   RoutingStats
	mutex   sync.RWMutex
}

// NewTrafficRouter creates a new traffic router
func NewTrafficRouter(rules []config.RoutingRule, workers config.WorkerConfig) *TrafficRouter {
	router := &TrafficRouter{
		rules:   make([]config.RoutingRule, len(rules)),
		workers: workers,
		stats: RoutingStats{
			DomainStats: make(map[string]int64),
		},
	}

	copy(router.rules, rules)
	router.sortRulesByPriority()

	return router
}

// Route determines how an HTTP request should be handled
func (r *TrafficRouter) Route(req *http.Request) RouteDecision {
	domain := req.URL.Hostname()
	if domain == "" {
		domain = req.Host
	}

	return r.RouteDomain(domain)
}

// RouteDomain determines how a domain should be handled
func (r *TrafficRouter) RouteDomain(domain string) RouteDecision {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	// Update stats
	atomic.AddInt64(&r.stats.TotalRequests, 1)
	r.updateDomainStats(domain)

	// Find matching rule
	matchedRule := r.findMatchingRule(domain)

	if matchedRule == nil {
		// Default to direct connection if no rule matches
		atomic.AddInt64(&r.stats.DirectCount, 1)
		return RouteDecision{
			Action: "DIRECT",
			Reason: "No matching rule found, using default direct connection",
		}
	}

	// Apply the matched rule
	decision := RouteDecision{
		Action:      matchedRule.Action,
		MatchedRule: matchedRule,
		Reason:      matchedRule.Description,
	}

	switch matchedRule.Action {
	case "DIRECT":
		atomic.AddInt64(&r.stats.DirectCount, 1)
	case "PROXY":
		atomic.AddInt64(&r.stats.ProxyCount, 1)
		// Get worker URL for the specified region
		if workerURL, exists := r.workers.Regions[matchedRule.Region]; exists {
			decision.WorkerURL = workerURL
		} else if r.workers.DefaultRegion != "" {
			if defaultURL, exists := r.workers.Regions[r.workers.DefaultRegion]; exists {
				decision.WorkerURL = defaultURL
				decision.Reason += " (using default region)"
			}
		}
	case "BLOCK":
		atomic.AddInt64(&r.stats.BlockedCount, 1)
	}

	return decision
}

// UpdateRules updates the routing rules and worker configuration
func (r *TrafficRouter) UpdateRules(rules []config.RoutingRule, workers config.WorkerConfig) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.rules = make([]config.RoutingRule, len(rules))
	copy(r.rules, rules)
	r.workers = workers

	r.sortRulesByPriority()
	return nil
}

// GetStats returns current routing statistics
func (r *TrafficRouter) GetStats() RoutingStats {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	// Create a copy of the stats
	stats := RoutingStats{
		TotalRequests: atomic.LoadInt64(&r.stats.TotalRequests),
		DirectCount:   atomic.LoadInt64(&r.stats.DirectCount),
		ProxyCount:    atomic.LoadInt64(&r.stats.ProxyCount),
		BlockedCount:  atomic.LoadInt64(&r.stats.BlockedCount),
		DomainStats:   make(map[string]int64),
	}

	// Copy domain stats
	for domain, count := range r.stats.DomainStats {
		stats.DomainStats[domain] = count
	}

	return stats
}

// findMatchingRule finds the highest priority rule that matches the domain
func (r *TrafficRouter) findMatchingRule(domain string) *config.RoutingRule {
	for _, rule := range r.rules {
		if r.matchesDomain(domain, rule.Domain) {
			return &rule
		}
	}
	return nil
}

// matchesDomain checks if a domain matches a pattern (supports wildcards)
func (r *TrafficRouter) matchesDomain(domain, pattern string) bool {
	// Exact match
	if domain == pattern {
		return true
	}

	// Wildcard match
	if strings.HasPrefix(pattern, "*.") {
		suffix := pattern[2:] // Remove "*."
		return strings.HasSuffix(domain, suffix)
	}

	// Prefix match (for patterns without wildcards)
	if strings.HasSuffix(domain, pattern) {
		return true
	}

	return false
}

// sortRulesByPriority sorts rules by priority (highest first)
func (r *TrafficRouter) sortRulesByPriority() {
	sort.Slice(r.rules, func(i, j int) bool {
		return r.rules[i].Priority > r.rules[j].Priority
	})
}

// updateDomainStats increments the counter for a domain
func (r *TrafficRouter) updateDomainStats(domain string) {
	if r.stats.DomainStats == nil {
		r.stats.DomainStats = make(map[string]int64)
	}
	r.stats.DomainStats[domain]++
}

// ResetStats resets all routing statistics
func (r *TrafficRouter) ResetStats() {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	atomic.StoreInt64(&r.stats.TotalRequests, 0)
	atomic.StoreInt64(&r.stats.DirectCount, 0)
	atomic.StoreInt64(&r.stats.ProxyCount, 0)
	atomic.StoreInt64(&r.stats.BlockedCount, 0)
	r.stats.DomainStats = make(map[string]int64)
}
