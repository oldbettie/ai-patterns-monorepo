# Plan: PDFEditorShell Refactor — Tool-Based Component Architecture

## Context

`PDFEditorShell.tsx` is ~450 lines and mixes concerns: document loading, zoom state, per-tool state (text formatting, signature storage), IntersectionObserver for page tracking, and inline JSX for three different conditional toolbar sections. Adding a new tool today means editing the shell directly — breaking the open/closed principle and increasing merge conflict risk.

The goal is to restructure so each tool is self-contained and adding a new tool is additive (new files only), not invasive.

---

## Proposed Architecture

### Step 1: Extract tool-specific state into hooks

**`useTextTool(editor, scale)`** — encapsulates everything text-specific:
- `selectedTextId`, `setSelectedTextId`
- `toolbarState` (fontFamily, fontSize, color)
- `setToolbarState`
- `handlePageClick(x, y, pageIndex)` → calls `editor.addTextElement`
- `justFinishedEditingRef`

**`useSignatureTool(editor, indexedDB, scale)`** — encapsulates everything signature-specific:
- `showSignatureModal`, `setShowSignatureModal`
- `signatureImages` (Map<id, dataURL>)
- `storedSignatures`, `editingSignatureElementId`
- `handleSaveSignature`, `handleEditSignature`, `handleDeleteSignature`
- `handlePageClick(x, y, pageIndex)` → places last-used signature or opens modal
- Image loading effect (the `useEffect` that loads missing signature images)

### Step 2: Extract inline JSX into small presentational components

| New component | What it replaces |
|---|---|
| `ToolSelector` | The 3 tool buttons (selector/text/signature) in the top bar |
| `ZoomControls` | The zoom −/reset/+ button cluster |
| `SignatureToolbar` | The conditional `activeTool === 'signature'` toolbar div (lines 344-367) |

`TextToolbar` already exists as its own file — no change needed.

### Step 3: Extract `PDFCanvas` component — tool-agnostic via render prop

The scrollable canvas area becomes a `PDFCanvas` component with **no knowledge of specific tools**:

```tsx
<PDFCanvas
  file={mainFile}
  totalPages={editor.totalPages}
  scale={scale}
  scrollRef={scrollRef}
  pageRefs={pageRefs}
  cursor={activeCursor}                         // 'text' | 'crosshair' | ''
  onPageClick={activeToolClickHandler}          // routed from active tool
  onPageChange={editor.setActivePage}           // for IntersectionObserver
  renderPageOverlays={(pageIndex) => (          // render prop — tool-agnostic
    <>
      {textTool.renderOverlay(pageIndex)}
      {signatureTool.renderOverlay(pageIndex)}
    </>
  )}
/>
```

**Each tool hook returns a `renderOverlay(pageIndex) => ReactNode`** that closes over its own state and callbacks — the canvas renders whatever it's given, no tool-specific props needed.

Adding tool #3 = add `{newTool.renderOverlay(pageIndex)}` to the shell's `renderPageOverlays`. No changes to `PDFCanvas`.

The IntersectionObserver (active page tracking) moves inside `PDFCanvas`, since it's canvas infrastructure, not tool logic.

### Result: Slim PDFEditorShell

After refactor, the shell becomes a pure composition layer:

```tsx
const textTool = useTextTool(editor, scale)
const signatureTool = useSignatureTool(editor, indexedDB, scale)

const activeCursor = activeTool === 'text' ? 'text' : activeTool === 'signature' ? 'crosshair' : ''
const activeToolClickHandler = activeTool === 'text' ? textTool.onPageClick : activeTool === 'signature' ? signatureTool.onPageClick : undefined

return (
  <>
    <ToolSelector activeTool={activeTool} onChange={setActiveTool} />
    <ZoomControls scale={scale} onChange={setScale} />
    {activeTool === 'text' && <TextToolbar {...textTool.toolbarProps} />}
    {activeTool === 'signature' && <SignatureToolbar {...signatureTool.toolbarProps} />}
    <PDFCanvas
      file={mainFile}
      totalPages={editor.totalPages}
      scale={scale}
      cursor={activeCursor}
      onPageClick={activeToolClickHandler}
      onPageChange={editor.setActivePage}
      renderPageOverlays={(i) => (
        <>
          {textTool.renderOverlay(i)}
          {signatureTool.renderOverlay(i)}
        </>
      )}
    />
    {signatureTool.modal}
  </>
)
```

Estimated shell size after refactor: ~100 lines (down from ~450).

---

## Critical Files to Modify

- `apps/web-app/components/pdf/PDFEditorShell.tsx` — gutted to composition-only
- New: `apps/web-app/components/pdf/ToolSelector.tsx`
- New: `apps/web-app/components/pdf/ZoomControls.tsx`
- New: `apps/web-app/components/pdf/SignatureToolbar.tsx`
- New: `apps/web-app/components/pdf/PDFCanvas.tsx`
- New: `apps/web-app/components/hooks/useTextTool.ts`
- New: `apps/web-app/components/hooks/useSignatureTool.ts`

---

## Future Extension Pattern

Once this is done, adding a new tool (e.g. a drawing/rectangle tool) would follow the pattern:
1. Create `useDrawingTool(editor, scale)` hook
2. Create `DrawingToolbar` component
3. Register in shell's `activeTool` union type and toolbar switch
4. No changes to `PDFCanvas`, `TextElement`, `SignatureElement`, etc.

---

## Verification

- Visually test: text tool places, edits, drags, deletes text elements
- Visually test: signature tool places, edits, deletes signatures
- Verify: zoom controls work, ctrl+scroll zoom works
- Verify: thumbnail sidebar updates active page correctly
- Verify: export produces correct PDF with both text and signature overlays
- No type errors: `pnpm type-check`
