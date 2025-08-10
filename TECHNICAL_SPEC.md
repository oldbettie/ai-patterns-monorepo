# TECHNICAL_SPEC.md - Auto Clipboard Sync

## Project Overview

**Auto Clipboard Sync** - A cross-device clipboard that securely synchronizes text and images in real time between all a user's devices. A lightweight Go desktop agent watches the OS clipboard for changes and sends them to a central API which persists the item and broadcasts it over WebSocket to all other connected devices. Receiving devices apply the clipboard item locally.

### Core Value Proposition

Seamless, private, and fast clipboard continuity across desktops without manual steps, cloud drives, or messaging apps. Optimized for low-latency sync, offline buffering, and safe handling of sensitive data.

## Updated Architecture (Go Agent + Next.js Web Platform)

### System Components

```
[User Device] → [Go Clipboard Agent] → [API + WS Hub] → [Postgres / Object Storage]
                         ↑                     ↓
                 [Web Dashboard (Next.js)] ← [Auth]
```

### Component Responsibilities

#### **Go Clipboard Agent (This Project)**

**Scope: Monitor and apply system clipboard, sync via API/WebSocket**

- **Clipboard Monitoring** - Detect changes to text and images with OS-specific watchers or polling fallback
- **Change Deduplication** - Hash-based detection to avoid loops and redundant uploads
- **Sync Client** - Authenticated REST (create/fetch) + WebSocket (subscribe/broadcast) with exponential backoff
- **Apply Clipboard** - Safely set clipboard on receipt, tagging origin to prevent echo
- **Local Queue** - Offline persistence and backfill on reconnect
- **Config & Health** - Device ID persistence, metrics, diagnostics, and self-update hooks

**Key Functions:**

```go
// Emit on local change (not from remote apply)
func (a *Agent) onClipboardChange(item ClipboardItem) {
    if a.isDuplicate(item) || a.isSelfEcho(item) {
        return
    }
    a.enqueueForUpload(item)
}

// Receive from server via WS and apply locally
func (a *Agent) onRemoteItem(msg RemoteClipboardMessage) {
    if msg.DeviceID == a.deviceID {
        return // ignore own events
    }
    if a.isNewerThanLocal(msg) {
        a.applyClipboard(msg)
    }
}
```

#### **Web Dashboard (This Repo: apps/web-dashboard)**

- **Next.js App Router** - Auth, device management, clipboard history
- **API Endpoints** - REST for item creation/fetch; WS endpoint for realtime fan-out
- **Business Logic** - Services layer (Drizzle repositories + service orchestration)
- **Policies** - Content limits, retention, and access control

#### **Realtime Sync (WebSocket Hub)**

- **Per-User Channels** - Broadcast clipboard items to all connected devices except origin
- **Presence** - Track connected devices for diagnostics
- **Backfill** - On connect, deliver missed items since last cursor

## Go Clipboard Agent Technical Specification

### Architecture Patterns

#### **Package Structure (Simplified)**

```
pkg/
├── clipboard/     # OS watchers/writers (macOS, Windows, Linux/Wayland)
├── sync/          # REST/WS client, backoff, offline queue, dedupe
├── config/        # Device ID, auth token, persisted settings
├── system/        # OS-specific integration (startup, permissions)
└── health/        # Metrics, diagnostics, self-test

cmd/
└── agent/         # Main application entry point
```

### Core Components

#### **Clipboard Monitoring & Apply** (`pkg/clipboard/`)

- **Platform Watchers**
  - macOS: NSPasteboard changeCount polling with debounced reads
  - Windows: AddClipboardFormatListener callback, UTF-8/text + BITMAP
  - Linux: X11 selection + Wayland portal; polling fallback
- **Content Types**: `text/plain` (UTF-8), images (`image/png`,`image/jpeg`)
- **Self-Echo Prevention**: Tag locally applied items with transient token and ignore subsequent local change events

#### **Sync Client** (`pkg/sync/`)

- **REST**: Create item, fetch since cursor; retries with exponential backoff and jitter
- **WebSocket**: Authenticated subscription; receive/broadcast in per-user scope
- **Deduplication**: SHA-256 content hash + type + normalized metadata
- **Offline Queue**: Encrypted local store, durable on crash; flush on reconnect
- **Ordering**: Server-assigned monotonic sequence (`seq`) per user; last-writer-wins

#### **Configuration Management** (`pkg/config/`)

- **Device Identity**: Stable `deviceId` generated on first run
- **Auth**: Short-lived WS tokens minted via authenticated REST with refresh
- **Settings**: Include max item size, allowed types, retention window, startup behavior

#### **System Integration** (`pkg/system/`)

- **Startup Registration**: Launch agent at login (macOS LaunchAgents, Windows Run key, Linux systemd user) optional
- **Permissions**: Clipboard access and screen capture disclaimers where required
- **Crash Resilience**: Single-instance lock, watchdog to restart on failure

### Configuration Schema

#### **Agent Config (local file)**

```go
type AgentConfig struct {
    DeviceID       string        `json:"device_id"`
    AccessToken    string        `json:"access_token"`        // persisted session token
    WsAuthToken    string        `json:"ws_auth_token"`       // short-lived, refreshed
    LastSeq        int64         `json:"last_seq"`            // last applied server seq
    QueuePath      string        `json:"queue_path"`
    MaxItemBytes   int64         `json:"max_item_bytes"`
    AllowImages    bool          `json:"allow_images"`
    CreatedAt      time.Time     `json:"created_at"`
    UpdatedAt      time.Time     `json:"updated_at"`
}

type ClipboardItem struct {
    ID            string            `json:"id"`
    UserID        string            `json:"user_id"`
    DeviceID      string            `json:"device_id"`
    Seq           int64             `json:"seq"`              // server assigned
    Type          string            `json:"type"`             // "text" | "image"
    Mime          string            `json:"mime"`             // e.g. "text/plain"
    Text          string            `json:"text,omitempty"`
    ImageBase64   string            `json:"image_base64,omitempty"` // initial impl
    ContentHash   string            `json:"content_hash"`      // sha256
    SizeBytes     int64             `json:"size_bytes"`
    Meta          map[string]string `json:"meta,omitempty"`    // e.g. width,height
    CreatedAt     time.Time         `json:"created_at"`
}
```

#### **API Integration (simplified)**

```go
// POST create item
func (c *Client) CreateItem(ctx context.Context, item ClipboardItem) (ClipboardItem, error)

// GET incremental fetch (since last seq)
func (c *Client) FetchSince(ctx context.Context, sinceSeq int64, limit int) ([]ClipboardItem, error)

// WS subscribe to realtime updates
func (c *Client) ConnectWebSocket(ctx context.Context, wsToken string) (<-chan ClipboardItem, error)
```

### Sync Logic

#### **Rules**

- **Ignore-Origin**: Do not echo clipboard updates back to the source `deviceId`
- **Last-Writer-Wins**: Apply only if `msg.seq > LastSeq`
- **Deduplicate**: Drop if `contentHash` matches latest applied of same `type`
- **Backfill**: On connect, `GET /items?since=LastSeq` then start WS stream
- **Limits**: Reject items above `MaxItemBytes`; compress images when possible

#### **Performance Optimization**

- **Debounced Reads**: Coalesce rapid clipboard changes
- **Binary Handling**: For images, base64 in v1; migrate to object storage URL when size exceeds threshold
- **Connection Reuse**: Single long-lived WS with keepalive pings
- **Smart Retry**: Fast-first retries, exponential backoff, max jitter

## Web Platform Technical Specification (Next.js + Drizzle)

### API & Realtime Routes

- `POST /api/core/v1/clipboard/items` (auth): create item
- `GET /api/core/v1/clipboard/items?since=<seq>&limit=<n>` (auth): incremental fetch
- `GET /api/core/v1/clipboard/ws` (auth via header or query token): WebSocket subscribe

All routes follow the shared wrapper pattern returning `{ data, error }`.

### Data Model (Drizzle ORM)

- **Tables**
  - `clipboard_items`: `id`, `user_id`, `device_id`, `seq`, `type`, `mime`, `text`, `image_base64`, `content_hash`, `size_bytes`, `meta` (json), `created_at`
  - `devices`: `id`, `user_id`, `name`, `platform`, `last_seen_at`, `created_at`
  - `ws_tokens`: `token`, `user_id`, `expires_at`, `created_at`

### Services & Repositories

- **Repositories** (`packages/database/src/repositories/`)
  - `clipboardRepository` (create, fetchSince, latestSeq)
  - `deviceRepository` (upsert presence)
- **Service Layer** (`apps/web-dashboard/lib/services/`)
  - `clipboardService` (validation, hash calc, sequence assignment, fan-out)

### WebSocket Hub Semantics

- **Authentication**: Short-lived WS token bound to user; validated on connect
- **Channeling**: Per-user group; origin-aware broadcast (exclude sender)
- **Ordering**: Broadcast in server `seq` order; single producer per user ensures monotonicity
- **Presence**: Periodic heartbeats update `devices.last_seen_at`

## Development & Deployment

### Build System

```bash
# Cross-platform builds for agent
go build -o dist/clipboard-agent-windows.exe cmd/agent/main.go
go build -o dist/clipboard-agent-macos cmd/agent/main.go
go build -o dist/clipboard-agent-linux cmd/agent/main.go
```

### Installation Process

1. **Download Binary** - Single executable per platform
2. **First Run** - Generates `deviceId`; user signs in via browser to link device
3. **Token Provisioning** - App exchanges session for long-lived access token and short-lived WS token
4. **Startup Option** - User may enable launch-at-login
5. **Background Service** - Agent runs in tray/background and reconnects automatically

### Testing Strategy

- **Unit Tests (Go)** - Clipboard normalization, hashing, dedupe, queue flush, retry backoff
- **Integration Tests (Go)** - WS reconnect, REST/WS interop, apply/echo prevention
- **Unit/Integration (Web, Vitest)** - Services, repositories, API handlers, WS hub
- **E2E (Optional)** - Multi-agent sync scenarios with fake clipboard layer

## Security & Privacy Considerations

### Local Security

- **Least Privilege** - Agent runs as user, not system
- **Local Storage** - Encrypt offline queue at rest (OS keychain/DPAPI/Libsecret)
- **Self-Echo Token** - Ephemeral tokens never persisted

### Network Security

- **TLS** - All REST/WS over HTTPS/WSS
- **Authentication** - Session-based REST; short-lived WS tokens (5–15 min) with refresh
- **Content Limits** - Server-side validation of size and types; reject dangerous payloads
- **Privacy** - No server logs of clipboard contents beyond DB persistence; structured audit events do not include content

### Optional End-to-End Encryption (Future)

- Per-user symmetric key; content encrypted client-side; server stores ciphertext and routes blindly. Key exchange via authenticated dashboard.

## Key Design Decisions

### **Separation of Concerns**

- **Go Agent**: Clipboard I/O, local queue, transport client
- **Web Platform**: Auth, persistence, sequencing, fan-out, policy
- **Database**: Drizzle-managed schema and migrations (PostgreSQL)

### **Technology Choices**

- **Go**: Cross-platform desktop integration and robust networking
- **Next.js (App Router)**: Dashboard + API routes; server components by default
- **Drizzle ORM + PostgreSQL**: Strong typing and portable migrations

### **Performance First**

- **Realtime Sync** - Single WS hub per user with keepalives
- **Low Overhead** - Debounced watchers, minimal allocations, bounded queues
- **Scalable Fan-out** - Per-user broadcast groups reduce contention

### **User-Centric Design**

- **Zero-friction** - Works automatically after sign-in
- **Predictable** - Clear limits, visibility into history and devices
- **Respectful** - Private by default; easy pause/disable

## Success Metrics

### **Performance Targets**

- **<300ms median** end-to-end sync for text
- **<800ms median** for small images (<1MB)
- **>99.95%** successful delivery across active connections
- **<25MB RAM** typical agent footprint; **<2% CPU** idle

### **User Experience Goals**

- **Instant continuity** - Copy on one device, paste on another with minimal delay
- **Offline-friendly** - Queue and backfill seamlessly
- **Safe by default** - Reasonable limits and privacy-preserving defaults

This architecture delivers fast, reliable clipboard synchronization while aligning with the project's Next.js + Go stack and service/repository pattern. It emphasizes low latency, device resilience, and privacy.
