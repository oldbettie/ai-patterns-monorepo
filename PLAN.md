# QR Code Micro-SaaS
## MVP Plan

---

## 1. Product Overview

A fast, privacy-respecting QR code generator. No signup walls, no watermarks, no tracking. Everything runs locally in the browser — history is stored in IndexedDB, nothing leaves the device.

**MVP goal:** Prove the product works. Local QR generation + history. Ship it.

---

## 2. Monorepo Placement

```
quick-pdfs/                          ← monorepo root
├── apps/
│   ├── pdf-editor/                  ← existing PDF editor
│   └── qr-code/                     ← NEW: QR code app
├── packages/
│   ├── database/                    ← shared (not used in MVP)
│   └── common/                      ← shared TypeScript types
├── vitest.config.mjs
└── package.json
```

---

## 3. MVP Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Same as web-app |
| Styling | Tailwind CSS v4 | Same as web-app |
| QR Generation | `qr-code-styling` | SVG/PNG with logo + colors |
| Local Storage | `idb` | IndexedDB — already in workspace |
| Testing | Vitest | Root config picks it up automatically |

No auth, no database in MVP.

---

## 4. MVP File Structure

```
apps/qr-code/
├── app/
│   ├── generate/
│   │   └── page.tsx                 ← main QR generator page
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                     ← redirect or simple landing
│   └── robots.ts
├── components/
│   ├── ui/                          ← base components (button, input, etc.)
│   ├── hooks/
│   │   └── useQRHistory.ts          ← IndexedDB read/write
│   └── qr/
│       ├── QRForm.tsx               ← input form + type selector
│       ├── QRPreview.tsx            ← live SVG/canvas preview
│       ├── QRHistory.tsx            ← sidebar list of saved QR codes
│       └── DownloadPanel.tsx        ← PNG / SVG / Print buttons
├── lib/
│   ├── qr/
│   │   ├── qrGenerator.ts           ← qr-code-styling wrappers
│   │   └── qrTypes.ts               ← URL/WiFi/vCard/SMS string formatters
│   └── utils.ts
├── next.config.js
├── package.json
├── postcss.config.js
└── tsconfig.json
```

---

## 5. `package.json` for `apps/qr-code`

Refactor existing copied files to fit this new app

## 6. `tsconfig.json` for `apps/qr-code`

Refactor existing copied files to fit this new app

## 7. `next.config.js` for `apps/qr-code`

Refactor existing copied files to fit this new app

## 8. IndexedDB Schema (`useQRHistory`)

```typescript
type QRHistoryEntry = {
  id: string
  label: string
  type: 'url' | 'wifi' | 'vcard' | 'sms' | 'email' | 'text'
  data: string           // raw QR data string
  svgData: string        // serialized SVG for thumbnail
  options: {
    fgColor: string
    bgColor: string
    dotStyle: 'square' | 'rounded' | 'dots'
    logoUrl?: string
  }
  createdAt: number
}
```

---

## 9. Build Steps (MVP only)

### Step 1 — Scaffold
I have made a copy of `/pdf-editor` and named it `qr-code`, rename and align all files and directories to the correct new app.

### Step 2 — QR generator core
Build `lib/qr/qrGenerator.ts` (wraps `qr-code-styling`). Build `components/qr/QRForm.tsx` with a URL input and `components/qr/QRPreview.tsx` with live re-render on every keystroke. URL-only at this stage.

### Step 3 — Download + print
Build `components/qr/DownloadPanel.tsx` with three buttons: Download PNG, Download SVG, Print. Print uses a CSS media query to hide all UI chrome — QR code and label only.

### Step 4 — IndexedDB history
Implement `components/hooks/useQRHistory.ts` with `idb`. Auto-save every generated QR. Build `components/qr/QRHistory.tsx` — click to reload, rename, delete. All local, no API calls.

### Step 5 — QR customization
Extend `QRForm` with foreground/background color pickers, dot style selector, logo upload. Persist per history entry.

### Step 6 — Additional QR types
Add a type selector to `QRForm`. Each type gets its own sub-form that assembles the correct data string. Types: URL, WiFi, vCard, SMS, Email, Plain Text.

### Step 7 — Polish + deploy
`app/page.tsx` adjust all SEO and landing pages to the new product, Ensure Responsive layout (form + preview side-by-side on desktop, stacked on mobile). Ensure I18N is implemented everywhere

---

## 10. Risks

- **Vitest `@` alias conflict** — root config aliases `@` to `apps/web-app`. Run qr-code tests with `pnpm --filter qr-code test` or add a local `vitest.config.mjs` inside `apps/qr-code/`. (MIght need to align pdf-editor after the rename)
- **Print CSS** — timebox to 30 minutes.
- **SVG vs PNG** — decide early. SVG for print quality; PNG for universal support.
- **qr-code-styling client-only** — it writes to a DOM element. Wrap in a `useEffect` / dynamic import to avoid SSR issues in Next.js.

---
---

# Post-MVP Roadmap

Everything below is deferred until MVP is live and validated.

---

## A. Full Monorepo Integration

Once MVP is proven, wire up the shared packages:

- Add `@quick-pdfs/common` and `@quick-pdfs/database` to `package.json`
- Add `transpilePackages: ['@quick-pdfs/database']` to `next.config.js`
- Add `@ducanh2912/next-pwa` for PWA / offline support (LOOK INTO)

---

## B. Auth

Consider moving auth to packages and sharing it with the apps:
- `lib/auth/`, `lib/auth/route-handler.ts`, `lib/serverUtils.ts`
- `app/(routes)/api/auth/`
- `app/login/`, `app/signup/` pages
- `lib/resend/` for email verification

---

## C. Database Schemas

Add to `packages/database/src/schemas.ts`:

```typescript
// QR codes saved to account
export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  label: text('label').notNull(),
  type: text('type').notNull(),
  data: text('data').notNull(),
  svgData: text('svg_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Donations
export const qrDonations = pgTable('qr_donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed'] }).notNull(),
  stripePaymentId: text('stripe_payment_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

Add repositories: `qrCodeRepository.ts`, `qrDonationRepository.ts`. and user repositories if they want to store and host QR codes on our servers

---

## D. API Routes + Services

Follow the web-app pattern exactly:

```typescript
// All routes use createRouteHandler
export const POST = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { user } = req
})

// All responses follow { data: T | null, error: ... | null }
```

Services in `lib/services/`:
- `qrService.ts` — CRUD for saved QR codes
- `donationService.ts` — Stripe checkout + status

Server actions in `actions/`:
- `qr-actions.ts`
- `donation-actions.ts`

---

## E. Donations

Port `donationService.ts` and `donationRepository.ts` from `web-app`. Add `components/donate/` and a `/donate` page. Same Polar flow.

---

## F. Dynamic QR Codes (Pro Tier)

Requires a redirect server: `yourdomain.com/r/<shortcode>`. The QR points to your domain; you resolve to the user's target URL. This means auth, database, billing, and analytics — a full separate phase.

The `qr_codes` table schema above is already designed to support it (just add a `shortcode` column and a redirect route).

Suggested URL schema: `yourdomain.com/r/<shortcode>`

---

## G. Revenue Model

| Tier | Model | Notes |
|---|---|---|
| Free | Ads + donations | Local-first, no account, unlimited static QR |
| Donations | Polar

Ad revenue requires meaningful traffic before paying anything — treat as passive upside at launch.
