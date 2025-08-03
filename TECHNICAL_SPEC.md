# TECHNICAL_SPEC.md - Family Privacy Proxy

## Project Overview

**Family Privacy Proxy** - A family-focused privacy solution that intelligently routes traffic based on application needs through a hybrid local-edge architecture.

### Core Value Proposition

Unlike traditional VPNs that can have slow connections, this maintains gaming/streaming performance with VPN bypass while protecting privacy where it matters most. Family-first design addresses an underserved market with shared policies and centralized management.

## Updated Architecture (Simplified Go + Web Platform)

### System Components

```
[User Device] → [Go Local Agent] → {DIRECT or Cloudflare Worker} → [Internet]
                      ↑
              [Web Config Platform] ← [User configures via browser]
                      ↓
                  [Database API]
```

### Component Responsibilities

#### **Go Local Agent (This Project)**

**Scope: System-wide traffic interception and routing decisions**

-   **Traffic Interception** - Capture ALL network traffic (browsers, Discord, Slack, games)
-   **TUN/TAP Interface** - Virtual network interface for transparent traffic capture
-   **Traffic Routing Engine** - Evaluate rules and decide: DIRECT, PROXY, or BLOCK
-   **System Integration** - Configure OS network settings automatically
-   **Config Synchronization** - Fetch user rules from web platform API
-   **Performance Optimization** - Keep gaming/streaming traffic local for speed

**Key Functions:**

```go
func (a *Agent) handleTraffic(packet NetworkPacket) {
    destination := packet.ExtractDestination()
    rule := a.evaluateRules(destination.Hostname())

    switch rule.Action {
    case "DIRECT":   // Send directly to internet (Discord, Steam, Netflix)
        forwardDirect(packet)
    case "PROXY":    // Send to Cloudflare Worker (social media from any app)
        forwardToWorker(packet, rule.WorkerURL)
    case "BLOCK":    // Block request (parental controls, malware)
        dropPacket(packet)
    }
}

// Captures traffic from ALL applications that are defined as requiring proxy connections:
// - Web browsers (Chrome, Firefox, Safari)
// - Desktop apps (Discord, Slack, Spotify)
// - Games (Steam, Epic Games, Minecraft)
// - System services (Windows Update, macOS software update)
```

#### **Web Configuration Platform (Separate Project)**

-   **React/Next.js Dashboard** - Family management interface
-   **User Authentication** - Account management and family profiles
-   **Rule Management** - Domain-based routing rules configuration
-   **Analytics Dashboard** - Usage monitoring and reporting
-   **API Endpoints** - Serve configurations to Go agents

#### **Cloudflare Workers (Separate Project)**

-   **Edge Proxy Servers** - Multiple regions (us-east, uk-london, etc.)
-   **TypeScript Implementation** - Familiar web technology
-   **Instant Deployment** - No server provisioning delays
-   **Global Performance** - 200+ edge locations worldwide

## Go Local Agent Technical Specification

### Architecture Patterns

#### **Package Structure (Simplified)**

```
pkg/
├── tunnel/         # TUN/TAP interface for traffic interception
├── router/         # Traffic routing engine and rule evaluation
├── config/         # Configuration fetching and management
├── system/         # OS-specific network configuration
└── health/         # Connection monitoring and diagnostics

cmd/
└── agent/          # Main application entry point
```

### Core Components

#### **Traffic Interception** (`pkg/tunnel/`)

-   **TUN/TAP Interface** - Virtual network interface for system-wide traffic capture
-   **Packet Processing** - Parse and route network packets from all applications
-   **Connection Tracking** - Maintain state for TCP connections and UDP flows
-   **Protocol Support** - Handle HTTP, HTTPS, TCP, UDP traffic transparently

#### **Traffic Router** (`pkg/router/`)

-   **Domain Pattern Matching** - Support wildcards (\*.facebook.com)
-   **Priority-Based Rules** - Higher priority rules override lower ones
-   **Rule Evaluation Engine** - Fast domain lookup and routing decisions
-   **Cache Management** - Cache routing decisions for performance

#### **Configuration Management** (`pkg/config/`)

-   **API Client** - Fetch user configuration from web platform
-   **Hot Reloading** - Update rules without restarting agent
-   **Local Caching** - Store config locally for offline operation
-   **Validation** - Ensure rule integrity and format

#### **System Integration** (`pkg/system/`)

-   **Network Interface Setup** - Configure TUN/TAP interface on all platforms
-   **Routing Table Management** - Direct all traffic through virtual interface
-   **Service Management** - Run as system service/daemon with elevated privileges
-   **Auto-Start** - Launch on system boot and maintain persistent connection

### Configuration Schema

#### **User Configuration Format**

```go
type UserConfig struct {
    DeviceID     string               `json:"device_id"`
    Rules        []RoutingRule        `json:"rules"`
    Workers      map[string]string    `json:"workers"`     // region -> worker URL
    UpdatedAt    time.Time            `json:"updated_at"`
}

type RoutingRule struct {
    ID          string      `json:"id"`
    Domain      string      `json:"domain"`           // "*.facebook.com"
    Action      string      `json:"action"`           // "DIRECT", "PROXY", "BLOCK"
    Region      string      `json:"region,omitempty"` // "us-east", "uk-london"
    Priority    int         `json:"priority"`
    Description string      `json:"description"`
}
```

#### **API Integration**

```go
// Simple HTTP API calls to web platform
func fetchUserConfig(deviceID string) (*UserConfig, error) {
    url := fmt.Sprintf("https://api.family-proxy.com/config/%s", deviceID)
    resp, err := http.Get(url)
    // Parse JSON response
}

func reportAnalytics(deviceID string, stats AnalyticsData) error {
    // Send usage statistics back to web platform
}
```

### Routing Logic

#### **Default Rules**

-   **Gaming Platforms** → DIRECT (Steam, Epic Games, Xbox Live)
-   **Streaming Services** → DIRECT (Netflix, YouTube, Spotify)
-   **Social Media** → PROXY via selected region (Facebook, Instagram, Twitter)
-   **General Browsing** → PROXY via selected region
-   **Blocked Content** → BLOCK (configurable per family profile)

#### **Performance Optimization**

-   **Local DNS Cache** - Reduce lookup times
-   **Connection Reuse** - Pool connections to Cloudflare Workers
-   **Minimal Latency** - Direct connections bypass all proxying
-   **Smart Fallback** - Direct connection if worker unavailable

### Development & Deployment

#### **Build System**

```bash
# Cross-platform builds
go build -o dist/family-proxy-windows.exe cmd/agent/main.go
go build -o dist/family-proxy-macos cmd/agent/main.go
go build -o dist/family-proxy-linux cmd/agent/main.go
```

#### **Installation Process**

1. **Download Binary** - Single executable per platform
2. **First Run** - Generates unique device ID
3. **Authentication** - User links device to family account via web
4. **Auto-Configuration** - Sets system proxy settings
5. **Background Service** - Runs continuously as system service

#### **Testing Strategy**

-   **Unit Tests** - Core routing logic and rule evaluation
-   **Integration Tests** - System proxy configuration
-   **Performance Tests** - Latency impact measurement
-   **Cross-Platform Tests** - Windows, macOS, Linux compatibility

### Security Considerations

#### **Local Security**

-   **Localhost Binding** - Proxy only accessible from local machine
-   **No Credential Storage** - Device ID only, no passwords
-   **Secure Communication** - HTTPS for all API calls
-   **Process Isolation** - Run with minimal system privileges

#### **Network Security**

-   **Certificate Validation** - Verify Cloudflare Worker certificates
-   **DNS Security** - Use secure DNS resolvers
-   **Traffic Isolation** - No inspection of HTTPS content
-   **Privacy Protection** - No logging of user browsing data

## Key Design Decisions

### **Separation of Concerns**

-   **Go Agent**: Local system integration and traffic routing only
-   **Web Platform**: All user interface, configuration, and analytics
-   **Cloudflare Workers**: All remote proxy functionality

### **Technology Choices**

-   **Go**: Excellent for local system integration and network proxy
-   **Web Technologies**: Familiar stack for UI/UX and business logic
-   **Cloudflare Workers**: Global edge network with instant deployment

### **Performance First**

-   **Local routing decisions** - No latency for direct connections
-   **Edge proxy execution** - Cloudflare's global network performance
-   **Minimal resource usage** - Lightweight Go agent

### **Family-Centric Design**

-   **Easy installation** - Single binary, auto-configuration
-   **Centralized management** - Parents configure via web dashboard
-   **Per-device policies** - Different rules for different family members
-   **Usage monitoring** - Family-friendly analytics and reporting

## Success Metrics

### **Performance Targets**

-   **<1ms latency overhead** for direct connections
-   **<50ms additional latency** for proxied connections
-   **<10MB memory usage** for Go agent
-   **99.9% uptime** for local proxy service

### **User Experience Goals**

-   **One-click installation** - No technical configuration required
-   **Instant rule updates** - Changes apply within 30 seconds
-   **Transparent operation** - Users don't notice performance impact
-   **Family-friendly** - Parents can manage all devices from web dashboard

This simplified architecture leverages the strengths of each technology while maintaining the family-focused user experience and performance optimization goals.
