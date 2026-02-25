---
name: tag-search
description: Tag-based codebase search strategy for this monorepo. Use this skill whenever you need to find files, functions, or code in the codebase — especially when working on a feature, debugging, or understanding how something works. Always invoke this skill BEFORE reaching for plain grep or glob searches. It layers AI tag filtering (e.g. @feature:rule-management, @domain:security, @backend) on top of normal search tools to dramatically narrow scope before doing targeted lookups.
---

# Tag Search

## Overview

This codebase uses structured AI tags in source file comments to classify code by feature, domain, and layer. When searching for code, always start with tags to narrow the relevant file set, then drill into those files with targeted searches. This is faster and more accurate than broad grep or glob searches across the whole monorepo.

## Search Workflow

### Step 1 — Consult the Tag Registry

Before searching, read `.claude/ai-tags.md` to see all available tags. Pick the most relevant combination:

- **Feature tag** (`@feature:*`) — which product capability does this touch?
- **Domain tag** (`@domain:*`) — which technical concern?
- **Layer tag** (`@backend`, `@api`, `@frontend`) — where in the stack?

You typically need 1–2 tags to narrow scope well. When uncertain, prefer the feature tag — it's the most discriminating.

### Step 2 — Grep for Tagged Files

Search for the tag pattern across all source files:

```
Grep pattern: "@feature:rule-management"
Output mode: files_with_matches
```

Run multiple tag greps in parallel when you have 2–3 candidate tags. Intersect the results mentally — files that appear in multiple tag searches are the highest-priority candidates.

Skip files in `node_modules/`, `.next/`, `dist/`, and `pnpm-lock.yaml`.

### Step 3 — Targeted Search Within Results

Once you have the narrowed file set, do specific searches:

- **Find a function**: `Grep pattern: "function fetchRules|fetchRules ="` within the tagged files
- **Find a component**: `Glob pattern: "apps/web-app/app/**/rules/**/*.tsx"`
- **Read key files**: `Read` the most likely candidates directly

Only fall back to a broad codebase grep (no file filter) when tag search returns no results or the tag registry has no matching tags.

---

## Worked Examples

**"Where is the routing rule validator?"**
1. Read `.claude/ai-tags.md` → identify `@feature:rule-management`
2. `Grep "@feature:rule-management" → files_with_matches`
3. Within results, `Grep "validator|schema|zod"` or look for `lib/validators/` files
4. `Read` the relevant file

**"Find SSL certificate renewal logic"**
1. Tags: `@feature:cert-management` and/or `@domain:security`
2. Grep both in parallel → intersect results
3. Search within those files for `renew|expire|certbot`

**"Which API routes handle traffic analytics?"**
1. Tags: `@feature:analytics` + `@api`
2. Grep → find route handler files
3. Read to confirm the endpoints

**"Show me all shared backend utilities"**
1. Tags: `@shared @backend` (grep for both in the same file)
2. `Grep "@shared" → files_with_matches`, then filter by `@backend` presence
3. List those files for the user

---

## Tag Quick Reference

Read `.claude/ai-tags.md` for the authoritative list. Current categories:

| Prefix | Examples |
|--------|---------|
| `@feature:` | `proxy-routing`, `rule-management`, `cert-management`, `web-ui`, `family-profiles`, `analytics`, `system-integration`, `config-management` |
| `@domain:` | `traffic`, `security`, `config`, `monitoring`, `system` |
| Layer | `@backend`, `@api`, `@frontend` |
| Special | `@reusable`, `@shared` |

---

## Fallback: No Matching Tags

If tag search yields nothing (the file isn't tagged, or the tag doesn't exist yet):

1. Note the gap — the file may need tags added
2. Fall back to `Grep` with meaningful keywords scoped to the relevant `apps/` or `packages/` subtree
3. Use `Glob` patterns based on naming conventions (`**/validators/*.ts`, `**/services/*.ts`)
4. Suggest adding appropriate tags to newly found files as a follow-up

---

## Adding Tags to Files

When you find an untagged file that clearly belongs to a feature/domain, suggest adding a tag comment near the top:

```ts
// @feature:rule-management @domain:config @backend
```

Check `.claude/ai-tags.md` before suggesting new tag names — reuse existing ones whenever possible. Guidelines: feature + domain + layer (2–3 tags minimum per file).
