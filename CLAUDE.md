# CLAUDE.md - Instructions for AI Assistant

## Project Overview

**Family Privacy Proxy** - A family-focused privacy solution that intelligently routes traffic based on application needs:
- **High-performance direct routing** for latency-sensitive applications (games, video calls, streaming)
- **Privacy-protecting proxy routing** for social media, browsing, and data-harvesting platforms
- **Family-centric management** with parental controls and usage monitoring

### Core Value Proposition
Unlike traditional VPNs that slow everything down, this maintains gaming/streaming performance while protecting privacy where it matters most. Family-first design addresses an underserved market with shared policies and centralized management.

### Technology Stack
- **Backend Service:** Go (excellent for network proxy services)
- **Initial UI:** Simple web interface served by Go server
- **Distribution:** Single binary cross-platform distribution
- **Database:** JSON/YAML configuration files (no external DB for MVP)

## Critical File Reading Guidelines

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use the gemini MCP to leverage Google Gemini's large context capacity.

### ⚠️ NEVER READ THESE FILES UNLESS ABSOLUTELY REQUIRED AND ALWAYS USE GEMINI MCP:

-   `vendor/` - Go dependency files
-   `go.sum` - Go module checksums
-   `dist/` - Build output directory
-   `web/static/` - Static assets unless specifically needed
-   Large log files or build artifacts

### READ THESE FILES FOR CONTEXT:

-   `go.mod` - Go dependencies and module info
-   `README.md` - Project setup and overview
-   `pkg/` - Core proxy packages and services
-   `cmd/` - Application entry points
-   `web/` - Web UI templates and static files
-   `configs/` - Configuration examples and defaults

### MCP Notes

#### Gemini MCP

Use gemini -p when:

-   Analyzing entire codebases or large directories
-   Comparing multiple large files
-   Need to understand project-wide patterns or architecture
-   Current context window is insufficient for the task
-   Working with files totaling more than 100KB
-   Verifying if specific features, patterns, or security measures are implemented
-   Checking for the presence of certain coding patterns across the entire codebase

Important Notes:

-   Paths in @ syntax are relative to your current working directory when invoking gemini
-   The CLI will include file contents directly in the context
-   No need for --yolo flag for read-only analysis
-   Gemini's context window can handle entire codebases that would overflow Claude's context
-   When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis

## Architecture & Patterns

ALWAYS USE THE TAGGING STRATEGY LISTED IN THIS FILE FOR FINDING CODE OR REFERENCES. If you cannot find anything as a last resort you can fallback to using normal
grep searching.

### Code Organization

-   **Package-based Architecture** with clear separation of concerns
-   **Proxy Core** in `pkg/proxy/` - Main proxy server functionality
-   **Traffic Router** in `pkg/router/` - Routing engine and rules
-   **Configuration Management** in `pkg/config/` - Settings and rule management
-   **System Integration** in `pkg/system/` - OS-specific proxy configuration
-   **Web UI** in `pkg/webui/` - HTTP server for management interface
-   **Analytics** in `pkg/analytics/` - Performance and usage monitoring
-   **Certificate Management** in `pkg/certs/` - SSL/TLS certificate handling

### Key Patterns

1. **Proxy Server** - Core HTTP/HTTPS proxy functionality using `goproxy` library
2. **Traffic Router** - Domain-based routing engine with rule evaluation
3. **Configuration** - JSON-based configuration with hot reloading
4. **System Integration** - Cross-platform proxy configuration (Windows/macOS/Linux)
5. **Certificate Management** - Root CA generation and domain certificate creation
6. **Web API** - REST endpoints for configuration and monitoring

## Development Commands

### Testing

```bash
go test ./...              # Run all tests
go test -v ./pkg/proxy     # Run specific package tests with verbose output
go test -bench=.           # Run benchmarks
go test -cover ./...       # Run tests with coverage
```

### Linting

```bash
golangci-lint run          # Run Go linter
go fmt ./...               # Format Go code
go vet ./...               # Vet Go code for issues
```

### Build

```bash
go build -o dist/family-proxy cmd/proxy/main.go    # Build single binary
./scripts/build.sh         # Cross-platform build script
```

### Development

```bash
go run cmd/proxy/main.go --config configs/default.json    # Run development server
⚠️ NEVER try to run without proper configuration
```

## Testing Patterns

Unit testing for core proxy functionality with integration tests for system components

### Test Structure

-   **Go testing** with standard library
-   **Mock interfaces** for testing proxy components
-   **Test files** end with `_test.go`
-   **Test setup** in `tests/` directory

### Testing Best Practices

```go
// Example test pattern
func TestProxyServer(t *testing.T) {
	// Setup test proxy server
	config := &Config{
		ListenPort: 8081,
		ListenAddress: "127.0.0.1",
	}
	
	server := NewProxyServer(config)
	
	t.Run("should handle HTTP requests", func(t *testing.T) {
		// Test HTTP proxy functionality
	})
	
	t.Run("should apply routing rules", func(t *testing.T) {
		// Test rule application
	})
}

func BenchmarkProxyThroughput(b *testing.B) {
	// Performance benchmarks
}
```

## Core Components

### Proxy Server Components

-   **ProxyServer** - Main proxy server with HTTP/HTTPS handling
-   **TrafficRouter** - Route evaluation and decision engine
-   **ConfigManager** - Configuration loading and hot reloading
-   **CertificateManager** - SSL certificate generation and caching

### Web UI Components

-   **Vanilla JavaScript** for client-side interactions
-   **Embedded templates** served by Go server
-   **REST API** for configuration and status
-   **WebSocket/SSE** for real-time updates

## API Patterns

### Route Structure

```
/api/
├── status          # Proxy server status
├── rules           # Routing rule management
├── profiles        # Family profile management
├── analytics       # Usage statistics
└── health          # Health check
```

API endpoints use standard Go HTTP handlers:

```go
// GET /api/status
func (s *WebUIServer) handleStatus(w http.ResponseWriter, r *http.Request) {
	status := s.proxyServer.GetStatus()
	responseJSON(w, status)
}

// POST /api/rules
func (s *WebUIServer) handleAddRule(w http.ResponseWriter, r *http.Request) {
	var rule RoutingRule
	if err := json.NewDecoder(r.Body).Decode(&rule); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	// Add rule logic
}
```

### API Conventions

-   **RESTful** endpoints with standard HTTP methods
-   **JSON** request/response format
-   **Structured error responses** with error codes and messages
-   **No authentication** for MVP (localhost-only access)

## Configuration Patterns

### JSON Configuration Structure

```go
type Configuration struct {
	ProxySettings   ProxyConfig     `json:"proxySettings"`
	RoutingRules    []RoutingRule   `json:"routingRules"`
	FamilyProfiles  []Profile       `json:"familyProfiles"`
	RemoteProxies   []ProxyEndpoint `json:"remoteProxies"`
	LastUpdated     time.Time       `json:"lastUpdated"`
}
```

### File-based Storage

-   **JSON configuration files** in `configs/` directory
-   **Hot reloading** with file system watchers
-   **Backup and restore** functionality
-   **Schema validation** for configuration integrity

## Security Considerations

### Certificate Security

-   **Root CA generation** for HTTPS inspection
-   **Certificate caching** for performance
-   **Secure private key storage**
-   **Platform-specific trust store integration**

### Configuration Security

-   **Input validation** for all user inputs
-   **Safe configuration parsing**
-   **Protection against proxy bypass attempts**

## Common Tasks

### Adding New Routing Features

1. Update `RoutingRule` struct in `pkg/router/types.go`
2. Implement rule evaluation in `pkg/router/engine.go`
3. Add API endpoint in `pkg/webui/handlers.go`
4. Update web UI in `web/static/js/main.js`
5. Add tests in corresponding `_test.go` files
6. Update configuration schema

### Adding New Proxy Features

1. Extend `ProxyServer` in `pkg/proxy/server.go`
2. Add configuration options in `pkg/config/types.go`
3. Implement feature logic with proper error handling
4. Add monitoring/analytics hooks
5. Create integration tests
6. Update documentation

## Performance Considerations

### Proxy Performance

-   **Connection pooling** for remote proxy servers
-   **Certificate caching** to avoid regeneration
-   **Goroutine management** for concurrent connections
-   **Memory optimization** for high-traffic scenarios

### System Integration

-   **Minimal latency overhead** for direct connections
-   **Efficient rule evaluation** with fast lookup
-   **Resource monitoring** and optimization
-   **Graceful degradation** when proxies are unavailable

## Troubleshooting

### Common Issues

1. **Certificate errors** - Check root CA installation and trust store
2. **Proxy bypass** - Verify system proxy configuration
3. **Performance issues** - Monitor connection pooling and rule evaluation
4. **Platform-specific issues** - Test on target operating systems

### Debug Tools

-   **Go pprof** for performance profiling
-   **Proxy logs** for traffic analysis
-   **System proxy settings** verification
-   **Certificate validation** tools

## Important Notes

-   **Never commit** private keys or certificates
-   **Follow** Go best practices and idioms
-   **Handle errors gracefully** with proper error wrapping
-   **Document** complex proxy logic and algorithms
-   **Minimize external dependencies** for security
-   **Use interfaces** for testability and modularity
-   **Follow** the package-based architecture
-   **Test** proxy functionality under load and edge cases
-   **Validate all user inputs** to prevent security issues
-   **Monitor performance** impact of new features

# AI MUST USE TOOLS

## AI Tagging System

## Overview

This project uses a structured tagging system to help AI assistants quickly find relevant code and maintain consistency across the codebase. Always check `ai-tags.md` for current tags before creating new ones.

## Core Tag Types

-   **@feature:** - Specific feature being implemented (e.g., `@feature:user-profile`)
-   **@domain:** - Business domain (e.g., `@domain:auth`, `@domain:payments`)
-   **@backend** / **@api** / **@frontend** - System layer
-   **@reusable** - Components/utilities that can be reused
-   **@shared** - Code shared across multiple domains

## Tag Format

Add tags as comments at the top of files:

```go
// @feature:proxy-routing @domain:traffic @backend
// @summary: Traffic routing engine with rule evaluation
```

```go
// @feature:cert-management @domain:security @backend
// @summary: Certificate generation and caching system
```

## Finding Related Code

Use grep to search for tags when looking for related code:

```bash
# Find all proxy routing related code
grep -r "@feature:proxy-routing" pkg/

# Find backend security code
grep -r "@domain:security.*@backend" pkg/

# Find all reusable components
grep -r "@reusable" pkg/

# Find code in specific domain
grep -r "@domain:traffic" pkg/
```

## Code Generation Guidelines

When generating new code:

1. **Always check ai-tags.md first** to use existing tags
2. **Infer tags from context:**

-   File path: `pkg/webui/` → likely `@frontend`
-   File path: `pkg/proxy/` → likely `@api` or `@backend`
-   File path: `pkg/router/` → likely `@backend`
-   Task context: "routing rules" → `@feature:proxy-routing @domain:traffic @backend`

3. **Use 2-3 tags minimum** (feature + domain + layer)
4. **Add a @summary comment** describing what the code does
5. **Create new tags sparingly** - try to use existing ones first

## Tag Inference Rules

-   **HTTP Handlers/API**: `@api` + relevant domain + feature
-   **Web UI Components**: `@frontend` + relevant domain + feature
-   **Core Services/Logic**: `@backend` + relevant domain + feature
-   **Configuration Structs**: `@backend` + relevant domain
-   **Utilities used across packages**: `@reusable` or `@shared`
-   **Configuration files**: `@shared` + relevant layer

## Examples

```go
// @feature:proxy-routing @domain:traffic @backend
// @summary: Traffic routing engine with rule evaluation
func (r *TrafficRouter) EvaluateRule(domain string) RouteType {
	// routing logic here
}
```

```go
// @domain:security @backend
// @summary: Certificate manager for HTTPS inspection
type CertificateManager struct {
	rootCA    *x509.Certificate
	certCache map[string]*tls.Certificate
}
```

## Maintenance

-   Update `ai-tags.md` when adding new tags
-   Periodically review tags for consistency
-   Remove unused tags from the reference file
