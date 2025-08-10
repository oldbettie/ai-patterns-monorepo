# Clipboard Agent

A cross-platform clipboard synchronization agent that automatically syncs clipboard content (text and images) across all your devices in real time.

## Features

- **Real-time sync** - Clipboard changes are instantly synchronized across all connected devices
- **Cross-platform** - Supports Windows, macOS, and Linux
- **Offline queue** - Items are queued when offline and synced when connection is restored
- **Self-echo prevention** - Prevents feedback loops when applying remote clipboard items
- **Configurable limits** - Set maximum item sizes and content type restrictions
- **Secure** - Content hashing for deduplication and integrity verification

## Installation

### Download Binary

Download the appropriate binary for your platform from the releases page:
- `clipboard-agent-linux-amd64` - Linux (64-bit)
- `clipboard-agent-darwin-amd64` - macOS Intel (64-bit)  
- `clipboard-agent-darwin-arm64` - macOS Apple Silicon
- `clipboard-agent-windows-amd64.exe` - Windows (64-bit)

### Build from Source

```bash
# Clone the repository
git clone <repository-url>
cd clipboard-agent

# Install dependencies
go mod tidy

# Build
go build cmd/agent/main.go

# Or build for all platforms
./scripts/build.sh
```

## Usage

### Basic Usage

```bash
# Start with default settings (connects to http://localhost:3000)
./clipboard-agent

# Specify API endpoint
./clipboard-agent --api https://your-api-endpoint.com

# Verbose logging
./clipboard-agent --api https://your-api-endpoint.com --verbose
```

### Configuration

The agent automatically creates a configuration file at:
- **Linux/macOS**: `~/.config/clipboard-agent/config.json`
- **Windows**: `%APPDATA%/clipboard-agent/config.json`

Example configuration:
```json
{
  "device_id": "linux-hostname-1234567890-abcdef12",
  "access_token": "",
  "ws_auth_token": "",
  "last_seq": 0,
  "queue_path": "/home/user/.config/clipboard-agent/clipboard-queue.json",
  "max_item_bytes": 10485760,
  "allow_images": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Command Line Options

```bash
./clipboard-agent [options]

Options:
  --version        Show version information
  --api URL        API endpoint URL (default: http://localhost:3000)
  --config PATH    Configuration file path (auto-detected if not provided)
  --v              Verbose logging
```

## Architecture

The clipboard agent consists of several key components:

### Clipboard Monitoring (`pkg/clipboard/`)
- **Cross-platform clipboard watchers** - Monitors system clipboard for changes
- **Content normalization** - Processes text and image content consistently
- **Self-echo prevention** - Prevents applying items that originated from this device

### Sync Client (`pkg/sync/`)
- **REST API integration** - Creates and fetches clipboard items via HTTP
- **WebSocket connection** - Real-time bidirectional communication
- **Offline queue** - Persists items when network is unavailable
- **Exponential backoff** - Intelligent retry logic for failed syncs

### System Integration (`pkg/system/`)
- **Device identity** - Generates and persists unique device identifiers
- **Configuration management** - Handles settings and authentication tokens
- **Platform-specific paths** - Uses appropriate config directories per OS

## Platform Support

### Linux
- **Text clipboard** - Full support via xclip, xsel, or wl-copy (Wayland)
- **Image clipboard** - Limited support (development in progress)
- **Requirements** - One of: xclip, xsel, or wl-copy

### macOS  
- **Text clipboard** - Full support via pbcopy/pbpaste
- **Image clipboard** - Basic support (development in progress)
- **Requirements** - Built-in macOS clipboard tools

### Windows
- **Text clipboard** - Full support via Windows API
- **Image clipboard** - Basic support (development in progress)  
- **Requirements** - Windows 7+ with system API access

## Development

### Prerequisites
- Go 1.24.5 or later
- Platform-specific clipboard tools (Linux only)

### Project Structure
```
clipboard-agent/
├── cmd/agent/           # Main application entry point
├── pkg/
│   ├── clipboard/       # Clipboard monitoring and manipulation
│   ├── config/          # Configuration types and defaults
│   ├── sync/            # REST/WebSocket client and offline queue
│   └── system/          # Device identity and system integration
├── scripts/             # Build and deployment scripts
└── tests/               # Test files
```

### Building
```bash
# Development build
go run cmd/agent/main.go --api http://localhost:3000 --verbose

# Production build
go build -o clipboard-agent cmd/agent/main.go

# Cross-platform builds
./scripts/build.sh
```

### Testing
```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test -v ./pkg/clipboard
```

## API Integration

The clipboard agent integrates with a REST API and WebSocket service:

### REST Endpoints
- `POST /api/core/v1/clipboard/items` - Create new clipboard item
- `GET /api/core/v1/clipboard/items?since=<seq>&limit=<n>` - Fetch items since sequence

### WebSocket
- `GET /api/core/v1/clipboard/ws` - Real-time clipboard item updates

### Response Format
All API responses follow the pattern:
```json
{
  "data": { ... },
  "error": null
}
```

## Security Considerations

- **Content hashing** - SHA-256 hashes prevent duplicate processing
- **Device isolation** - Items from the same device are not echoed back
- **Configurable limits** - Maximum item sizes prevent abuse
- **Local encryption** - Offline queue can be encrypted (future feature)

## Troubleshooting

### Common Issues

1. **"No clipboard tool found"** (Linux)
   - Install xclip: `sudo apt install xclip`
   - Or install xsel: `sudo apt install xsel`  
   - Or use wl-copy for Wayland

2. **Connection refused**
   - Verify the API endpoint is running
   - Check firewall settings
   - Ensure correct URL format

3. **Items not syncing**
   - Check verbose logs with `--v` flag
   - Verify device has valid access token
   - Check network connectivity

### Debug Mode
```bash
# Enable verbose logging
./clipboard-agent --v --api http://localhost:3000

# Check configuration location
./clipboard-agent --config /path/to/debug/config.json
```

### Logs
The agent logs to standard output. Key log messages include:
- Device ID generation and loading
- Clipboard change detection  
- Sync successes and failures
- WebSocket connection status
- Queue processing activities

## License

[Add your license information here]