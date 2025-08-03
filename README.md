# Family Privacy Proxy - Local Agent

A family-focused privacy solution that intelligently routes traffic based on application needs through a hybrid local-edge architecture.

## Core Value Proposition

Unlike traditional VPNs that slow everything down, this maintains gaming/streaming performance while protecting privacy where it matters most. Family-first design addresses an underserved market with shared policies and centralized management.

## Architecture Overview

This repository contains the **Go Local Agent** component of the Family Privacy Proxy system:

```
[User Device] → [Go Local Agent] → {DIRECT or Cloudflare Worker} → [Internet]
                      ↑
              [Web Config Platform] ← [User configures via browser]
                      ↓
                  [Database API]
```

### Component Responsibilities

- **Go Local Agent (This Project)**: System-wide traffic interception and routing decisions
- **Web Configuration Platform (Separate Project)**: Family management interface, authentication, rule management
- **Cloudflare Workers (Separate Project)**: Edge proxy servers in multiple regions

## Features

### Traffic Interception
- **System-wide Coverage**: Captures traffic from ALL applications (browsers, Discord, Slack, games)
- **TUN/TAP Interface**: Virtual network interface for transparent traffic capture (planned)
- **HTTP Proxy**: Current implementation using local HTTP proxy on localhost:8081

### Intelligent Routing
- **Gaming Performance**: Steam, Epic Games, Discord → DIRECT (low latency)
- **Streaming Quality**: Netflix, YouTube, Spotify → DIRECT (high bandwidth)
- **Privacy Protection**: Facebook, Instagram, Twitter → PROXY via Cloudflare Workers
- **Parental Controls**: Configurable blocking rules

### Configuration Management
- **Mock API Client**: Development mode with hardcoded rules
- **Hot Reloading**: Configuration updates without restart
- **Analytics Reporting**: Usage statistics to web platform

## Quick Start

### Prerequisites

- Go 1.21 or later
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd proxy-fam
```

2. Install dependencies:
```bash
go mod tidy
```

3. Run the agent:
```bash
./run.sh
```

This will:
- Build the agent binary
- Start the local proxy on localhost:8081
- Use mock configuration for development
- Enable verbose logging

### Manual Build

```bash
# Build the agent
go build -o dist/family-proxy-agent cmd/agent/main.go

# Run with options
./dist/family-proxy-agent --api mock --v
```

### Command Line Options

```bash
family-proxy-agent [options]

Options:
  --version           Show version information
  --api string        API endpoint URL (default "mock")
  --device-id string  Device ID (auto-generated if not provided)
  --v                 Verbose logging
```

## Configuration

The agent supports two configuration modes:

### Mock Mode (Development)
```bash
./family-proxy-agent --api mock
```
Uses hardcoded rules for development and testing.

### Production Mode (Future)
```bash
./family-proxy-agent --api https://api.family-proxy.com
```
Fetches configuration from the web platform API.

## Default Routing Rules

The mock configuration includes these default rules:

### Gaming (DIRECT - High Performance)
- `*.steampowered.com` → DIRECT
- `*.epicgames.com` → DIRECT

### Streaming (DIRECT - High Bandwidth)
- `*.netflix.com` → DIRECT
- `*.youtube.com` → DIRECT

### Social Media (PROXY - Privacy Protection)
- `*.facebook.com` → PROXY via us-east.family-proxy.workers.dev
- `*.instagram.com` → PROXY via us-east.family-proxy.workers.dev
- `*.twitter.com` → PROXY via us-east.family-proxy.workers.dev

## Testing

### Test the Proxy
1. Start the agent: `./run.sh`
2. Configure your browser to use proxy: `localhost:8081`
3. Visit different websites and observe the routing decisions in the logs

### Example Log Output
```
2025/08/03 10:30:15 Routing GET https://store.steampowered.com/ -> DIRECT (Direct connection for Steam gaming platform)
2025/08/03 10:30:20 Routing GET https://facebook.com/ -> PROXY (Route Facebook through proxy for privacy)
```

## Development

### Package Structure

```
pkg/
├── config/         # Configuration types and mock API client
├── router/         # Traffic routing engine and rule evaluation  
└── proxy/          # Local proxy agent implementation

cmd/
└── agent/          # Main application entry point
```

### Core Components

- **Traffic Router**: Evaluates domain patterns and applies routing rules
- **Local Agent**: HTTP proxy server that routes traffic based on rules
- **Config Client**: Fetches configuration from API (mock or real)
- **Analytics**: Reports usage statistics back to web platform

### Adding New Rules

Rules are currently hardcoded in `pkg/config/types.go`. In production, these will come from the web platform API.

```go
{
    ID:          "custom-rule",
    Domain:      "*.example.com",
    Action:      "PROXY",
    Region:      "uk-london",
    Priority:    200,
    Description: "Route example.com through UK proxy",
}
```

### Running Tests

```bash
go test ./...
```

## Roadmap

### Current Status
- ✅ Basic HTTP proxy functionality
- ✅ Domain-based routing rules
- ✅ Mock API client
- ✅ Analytics reporting
- ✅ Hot configuration reloading

### Planned Features
- 🔄 TUN/TAP interface for system-wide traffic capture
- 🔄 OS-specific system proxy configuration
- 🔄 Service/daemon installation
- 🔄 Production API integration
- 🔄 Enhanced security features

## Related Projects

- **Web Configuration Platform**: React/Next.js dashboard for family management
- **Cloudflare Workers**: TypeScript proxy implementations for edge routing

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

For questions or support, please open an issue.