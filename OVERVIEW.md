# Auto Clipboard Sync - Project Overview & Roadmap

## Product Concept

A cross-device clipboard that securely synchronizes text and images in real time across all a user's devices. The desktop agent watches the system clipboard and uses an authenticated API + WebSocket hub to persist and broadcast updates. Other devices receive the item and apply it to their local clipboard.

- **Realtime sync** for text and images
- **Low-latency** delivery with offline queuing and backfill
- **Privacy-first** design with optional end-to-end encryption (future)
- **Device management** and clipboard history via the web dashboard

## Core Value Proposition

Eliminate the friction of sending snippets, commands, and screenshots between computers. Copy once, paste anywhere—securely and instantly.

## Technology Stack

- **Go Clipboard Agent:** Cross-platform desktop integration (macOS, Windows, Linux)
- **Web Dashboard:** Next.js App Router (auth, devices, history, settings)
- **Realtime Sync:** WebSocket hub with per-user channels and origin-aware broadcasts
- **Database:** PostgreSQL with Drizzle ORM (typed repositories and migrations)
- **Shared Packages:** Common types and utilities
- **Deployment:** Docker for web/dashboard + DB; native binaries for the agent

## MVP Scope (Weeks 1–4)

- Clipboard sync for `text/plain` and small images (`image/png`/`image/jpeg`)
- Go agent with self-echo prevention, hashing/deduplication, and offline queue
- Next.js APIs: create item, fetch since cursor; WebSocket subscribe
- Sequencing per user (`seq`), last-writer-wins, and backfill on connect
- Device management UI and basic history view
- Authentication and session management
- Limits and validation (max item size, allowed types)

## MVP Timeline (4–6 weeks)

### Week 1–2: Agent + Backend Foundations

- Clipboard watchers and apply on macOS/Windows/Linux
- REST client, WebSocket client with reconnect/backoff
- Next.js project setup with auth and database baseline (Drizzle)
- Schema: `clipboard_items`, `devices`, `ws_tokens`

### Week 3–4: Realtime + History + Policies

- WebSocket hub with per-user channels, origin-aware broadcast
- History fetch since cursor, pagination
- Limits (size/type), validation with Zod, error handling
- Device presence and last seen UI

### Week 5–6: Polish + Stability

- Robust dedupe and crash-safe offline queue
- Agent startup-at-login option and tray integration (basic)
- Performance and load tests (WS fan-out, DB hot paths)
- Observability and diagnostics

## Long-Term Feature Roadmap

### Additional Clipboard Types

- Rich text (RTF/HTML), files/attachments (object storage), structured snippets

### Mobile & Browser

- iOS/Android lightweight agents
- Browser extension for tab-to-tab sync

### Advanced Privacy & Security

- End-to-end encryption (per-user symmetric key)
- Per-device approvals and granular permissions

### Collaboration & Sharing

- Share clipboards with trusted contacts or teams
- Spaces (personal, work) with scoped history

### Productivity Enhancements

- Snippet pinning and search
- OCR for images, quick actions (copy as code block, sanitize formatting)
- Cross-device hotkeys and rules (ignore apps, throttle noisy sources)

## Technical Risk Assessment

**High Priority Risks**

- OS clipboard API variability (Wayland, X11, macOS sandboxing)
- Clipboard event loops and dedup accuracy
- Image format conversions and size overhead (base64 vs. binary)
- WebSocket scaling and ordering guarantees per user

**Medium Priority Risks**

- Auth/session edge cases for short-lived WS tokens
- Offline queue corruption and recovery
- Database hot partitions and sequence contention

**Mitigations**

- Normalize content and hash; tag applied origin to prevent echo
- Debounce watchers; limit item sizes; compress images when possible
- Monotonic per-user sequencing with simple producer path
- Backoff with jitter; WS heartbeats and presence tracking

## Market Opportunity

**Target Users**

- Developers, designers, and knowledge workers with multiple devices
- Remote workers and cross-platform users (macOS/Windows/Linux)

**Competitive Advantages**

- Focus on reliability and low-latency sync
- Privacy-first with clear roadmap to E2EE
- Open, extensible architecture with typed APIs and services

## Success Metrics

**Technical Metrics**

- Median end-to-end latency: text <300ms; small images <800ms
- Delivery success rate >99.95% across active sessions
- Crash-free sessions >99.9%; agent RAM <25MB typical; idle CPU <2%

**User Metrics**

- Weekly active devices per user
- 4-week retention and daily paste success rate
- Time-to-first-sync after login

## Business Considerations (Optional)

**Monetization**

- Free tier: text-only, limited history
- Pro: images, longer history, E2EE, snippets, teams

**Infrastructure Costs**

- Web/API hosting, DB, and WebSocket bandwidth
- Optional object storage for large binaries

---

This overview aligns with the updated technical spec and the monorepo's Next.js + Go architecture, focusing on low-latency sync, device resilience, and privacy by design.
