# Go proxy service.

### Key Components

- **Local Proxy Agent** (`pkg/proxy/`): HTTP proxy server handling incoming requests
- **Traffic Router** (`pkg/router/`): Rule engine for making routing decisions
- **Configuration Manager** (`pkg/config/`): API client for fetching rules and reporting analytics
- **Main Agent** (`cmd/agent/`): Entry point orchestrating all components

## Features

### Traffic Routing

- **Rule-based routing** with domain pattern matching (e.g., `*.facebook.com`)
- **Priority-based rule evaluation** (higher priority rules take precedence)
- **Multiple routing actions**:
  - `DIRECT`: Route traffic directly to destination
  - `PROXY`: Route through Cloudflare Workers in specified regions
  - `BLOCK`: Block access to domain

### Configuration Management

- **Dynamic rule updates** via API polling (every 30 seconds)
- **Device identification** with auto-generated device IDs
- **Mock API support** for development and testing
- **Hot-reload** of routing rules without service restart

### Analytics & Monitoring

- **Traffic statistics** collection (total, direct, proxy, blocked requests)
- **Domain-level analytics** tracking most accessed sites
- **Periodic reporting** to central analytics API (every 5 minutes)
- **Real-time statistics** via router interface

### Operational Features

- **Graceful shutdown** with signal handling
- **Verbose logging** with configurable log levels
- **Health monitoring** and error reporting
- **Cross-platform support** (Linux, macOS, Windows)

## Installation & Usage

### Prerequisites

- Go 1.24.5 or later
- Network access for API communication

### Building

```bash
# Build for current platform
npm run build
# or
go build -o dist/family-proxy cmd/agent/main.go

# Build for all platforms
npm run build:all
```

### Running

#### Quick Start (Development)

```bash
# Run with default settings (mock API)
./run.sh
# or
npm run dev
```

#### Production Usage

```bash
# Run with custom API endpoint
./dist/family-proxy --api https://api.familyproxy.com --device-id my-device

# Run with verbose logging
./dist/family-proxy --api https://api.familyproxy.com --v

# Show version
./dist/family-proxy --version
```

#### Command Line Options

- `--api`: API endpoint URL (default: "mock" for development)
- `--device-id`: Device identifier (auto-generated if not provided)
- `--v`: Enable verbose logging
- `--version`: Show version information

### Configuration

The agent fetches configuration from the API endpoint, including:

```json
{
  "device_id": "device-12345",
  "rules": [
    {
      "id": "rule-1",
      "domain": "*.facebook.com",
      "action": "PROXY",
      "region": "us-east",
      "priority": 100,
      "description": "Route Facebook through US proxy"
    },
    {
      "id": "rule-2",
      "domain": "*.local",
      "action": "DIRECT",
      "priority": 200,
      "description": "Direct routing for local services"
    }
  ],
  "workers": {
    "default_region": "us-east",
    "regions": {
      "us-east": "https://proxy-us-east.workers.dev",
      "uk-london": "https://proxy-uk.workers.dev"
    }
  }
}
```

## Development

### Project Structure
