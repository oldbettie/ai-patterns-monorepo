# Local-First Browser Tool Suite — Implementation Plan

## Overview

This document outlines the plan for building a suite of free, local-first browser tools. Each tool is a standalone Next.js app within a shared monorepo. No user files are ever sent to a server. All processing happens in the browser, files are stored in IndexedDB, and each app is fully functional offline after the initial load.

The strategy is to target tools that currently sit behind subscriptions or paywalls despite being entirely achievable client-side, and offer them for free supported by ads and donations. Each tool cross-links to others in the suite to build domain authority and SEO value collectively.

---

## Monorepo Structure

```
/apps
  /qr-generator
  /image-watermarker
  /password-generator
  /pdf-editor           ← existing
  ... (future tools)

/packages
  /ui                   ← shared components (file picker, buttons, modals, banners)
  /file-utils           ← IndexedDB helpers, download handlers, file type detection
  /offline              ← service worker config, cache strategies, PWA helpers
  /analytics            ← shared ad units, analytics setup (privacy-respecting)
  /seo                  ← meta templates, structured data, sitemap config
  /config               ← shared tailwind.config, tsconfig base, eslint config
```

Each app in `/apps` is deployed as an independent Vercel project on its own domain, sharing packages via workspace references. A breaking change in a package should be treated carefully once the suite grows — consider semver versioning on shared packages beyond the first 3-4 tools.

---

## Core Principles (Apply to Every Tool)

- **Local first** — no file or user data is ever transmitted to a server
- **Offline capable** — service worker caches all assets on first load; old versions remain functional if the network is unavailable
- **IndexedDB persistence** — any user history, saved items, or preferences are stored locally in IndexedDB
- **Privacy banner** — every tool displays a consistent "Processed locally, never uploaded" message (shared UI component)
- **Progressive Web App** — each tool should be installable as a PWA
- **No login required** — ever, for core functionality
- **Monetisation** — tasteful display ads and an optional donation prompt; no paywalls

---

## Shared Package Priorities

Before building Tool 1, establish these packages as they will be reused immediately:

### `@suite/ui`
- `FileDropZone` — drag and drop + click to upload, accepts mime type config
- `DownloadButton` — triggers client-side file download
- `PrivacyBanner` — "Your files never leave your browser" notice
- `DonationPrompt` — soft prompt shown after a successful action
- `ToolLayout` — consistent page wrapper with nav, footer, cross-links to other tools

### `@suite/offline`
- Service worker registration helper
- Cache-first strategy config for static assets
- Network-first with cache fallback for pages
- Manifest generator helper for PWA config

### `@suite/file-utils`
- `saveToIDB(key, data)` / `loadFromIDB(key)` — simple IndexedDB read/write wrapper
- `triggerDownload(blob, filename)` — initiates a file download from a Blob
- `detectFileType(file)` — returns mime type and extension info

---

## Tool 1 — QR Code Generator

### Why This Tool
QR code generators are universally paywalled or feature-limited in free tiers. There is no genuinely free, no-account, offline-capable option that covers custom colours, logo embedding, and bulk generation. This is entirely achievable in-browser.

### Domain Suggestion
`qr.yoursuite.com` or a standalone domain like `freeqr.tools`

### Library
**`qrcode`** (npm) — lightweight, well maintained, works client-side with no issues. Renders to Canvas or SVG.

For logo embedding, render the QR to Canvas then draw the logo image on top using the Canvas 2D API.

### Features — V1

- Text / URL input
- Selectable output format: SVG or PNG
- Foreground and background colour pickers
- Error correction level selector (L / M / Q / H)
- Live preview as the user types
- Download button (single file)
- History of last 10 generated QR codes stored in IndexedDB

### Features — V2

- Logo/image embedding in centre of QR code
- Custom size selector
- Batch generation from CSV input (one URL per row → zip of QR images)
- WiFi QR generator (SSID, password, encryption type form → QR)
- vCard QR generator (name, phone, email form → QR)
- QR code reader (upload an image and decode it)

### Implementation Notes

The QR generation itself is synchronous and instant so no loading states are needed for basic use. Logo embedding requires the logo to be loaded into an `Image` element before drawing to Canvas — handle the async load carefully.

For batch generation, use JSZip (also runs entirely client-side) to bundle the output files.

Offline support is straightforward here — there is no network dependency whatsoever after first load. The service worker should cache everything aggressively.

### PWA Manifest
```json
{
  "name": "QR Code Generator",
  "short_name": "QR Gen",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000"
}
```

### Cross-links to Other Suite Tools
- Image Watermarker (watermark your QR code images)
- Password Generator (generate a secure password, then make a QR for it)

---

## Tool 2 — Image Watermarker

### Why This Tool
Bulk image watermarking tools are almost universally paid. The use case (photographers, small businesses, content creators) is broad and the people who need it most often can't justify a subscription.

### Domain Suggestion
`watermark.yoursuite.com`

### Libraries
- **Browser Canvas API** — no library needed for the core compositing
- **`browser-image-compression`** — optional, for output size management
- **`jszip`** — for bulk download of watermarked images

### Features — V1

- Upload one or more images (JPEG, PNG, WebP)
- Upload a watermark image (PNG with transparency recommended)
- Position selector: 9-point grid (top-left, top-centre, top-right, centre, etc.)
- Opacity slider for the watermark
- Size control (as % of the base image width)
- Margin/padding offset control
- Live preview on the first uploaded image
- Download individual or all as ZIP
- Watermark settings saved to IndexedDB so they persist between sessions

### Features — V2

- Text watermark option (font, size, colour, opacity) as an alternative to image watermark
- Tiled/repeated watermark mode
- Batch processing progress bar for large image sets
- Support for HEIC input (via `heic2any` library, also client-side)

### Implementation Notes

The core flow is: load each image into a Canvas element, draw the watermark image on top at the calculated position, then export via `canvas.toBlob()`. This is all synchronous-compatible but should be queued for bulk jobs to avoid locking the main thread — use a Web Worker for processing multiple images.

Watermark position calculation: get the canvas dimensions, get the watermark dimensions (scaled to the % size setting), then calculate x/y coordinates based on the selected grid position plus the margin offset.

### Cross-links
- QR Code Generator (generate a QR code then watermark it onto your images)
- Image Compressor (compress your watermarked images before sharing)
- PDF Editor (embed watermarked images into a PDF)

---

## Tool 3 — Password Generator

### Why This Tool
Password generators exist but most are embedded in password managers behind accounts. A standalone, offline, open privacy-model generator has genuine SEO value and serves users who don't want to trust a third party even to generate a password.

### Domain Suggestion
`passwords.yoursuite.com`

### Libraries
- **Web Crypto API** (`crypto.getRandomValues`) — built into every modern browser, no library needed, cryptographically secure

### Features — V1

- Length slider (8–128 characters)
- Character set toggles: uppercase, lowercase, numbers, symbols
- Exclude ambiguous characters option (0, O, l, 1, etc.)
- Generate one password
- Copy to clipboard button with visual confirmation
- Strength indicator (entropy-based, calculated client-side)
- No history stored — passwords are explicitly ephemeral by design (make this a feature, explain it clearly)

### Features — V2

- Passphrase generator (Diceware-style, wordlist bundled with the app)
- Bulk generation (generate N passwords at once, copy all or download as TXT)
- PIN generator mode
- Memorable password mode (word + numbers + symbol pattern)
- Password strength checker (enter your own password, get entropy score — explicitly never transmitted)

### Implementation Notes

Use `crypto.getRandomValues(new Uint32Array(length))` and map values to your character set using modulo. Avoid `Math.random()` entirely — it is not cryptographically secure and you should call this out in the UI as a trust signal.

The Diceware wordlist for V2 (EFF large wordlist) is ~400KB. Bundle it as a static JSON file — it caches on first load and is available offline thereafter.

Entropy calculation: `log2(charsetSize ^ passwordLength)`. Display as bits of entropy with a plain English label (weak / fair / strong / very strong).

### Cross-links
- QR Code Generator (turn your password into a QR code for easy sharing to another device)

---

## Offline Strategy (All Tools)

Each app should implement the following service worker behaviour using **Workbox** (via `next-pwa` or manual Workbox config):

- **Cache first** for all static assets (JS bundles, fonts, icons, images)
- **Stale while revalidate** for page HTML — serve cached version immediately, update in background
- **Network first with cache fallback** for any external API calls (only relevant for tools like currency converter in future)
- On install, pre-cache all critical assets so the app works offline from the very first visit after load

The user should never see a broken experience because they are offline. At most they see a subtle "You are offline — using cached version" banner.

---

## SEO and Cross-linking Strategy

Each tool should include a "More Free Tools" section in the footer listing the other apps in the suite with descriptive anchor text. This is the primary backlinking mechanism.

Example footer links:
- "Free PDF Editor — edit PDFs in your browser"
- "Free QR Code Generator — no signup required"
- "Free Image Watermarker — bulk watermark in seconds"

Each tool should also have a dedicated `/about` or `/how-it-works` page explaining the local-first approach in detail. This content is valuable for SEO and for building user trust.

Structured data (`application/ld+json`) should be added to every tool using the `SoftwareApplication` schema type. This is handled in the shared `@suite/seo` package.

---

## Future Tools (Backlog)

The following tools follow the same local-first model and are strong candidates for the next phase. Prioritised roughly by simplicity and search demand:

**Quick wins (simple to build, high search volume)**
- Image format converter (PNG ↔ JPG ↔ WebP ↔ AVIF) — Canvas API
- EXIF data viewer and stripper — `exifr` library, fully client-side
- Base64 encoder/decoder — no library needed
- JSON formatter and validator — no library needed
- Text case converter (camelCase, snake_case, SCREAMING_SNAKE, Title Case) — no library needed
- Word and character counter — no library needed

**Medium complexity**
- Image compressor — `browser-image-compression`
- CSV ↔ JSON converter — `papaparse`
- PDF merger and splitter — `pdf-lib` (same as existing PDF editor)
- Favicon generator (upload image → get all favicon sizes as ZIP)
- Image background remover — `@imgly/background-removal` (WASM, runs in browser)

**More involved but high value**
- Audio trimmer — Web Audio API + FFmpeg WASM
- Video trimmer — FFmpeg WASM (`@ffmpeg/ffmpeg`)
- Invoice generator — PDF output via `pdf-lib`, saved to IndexedDB
- Private encrypted notes — AES encryption via Web Crypto API, stored in IndexedDB
- Barcode generator — `bwip-js`, fully client-side

---

## Continuing This Plan

This document covers the first three tools. To continue planning the next batch of tools — including the data tools (JSON formatter, CSV converter, diff tool) and developer tools (CSS beautifier, regex tester, hash generator) — refer back to the original planning conversation or extend this document with a new section following the same structure used above.

Each new tool section should cover: why the tool, domain suggestion, libraries, V1 features, V2 features, implementation notes, and cross-links.