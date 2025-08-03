# TODO

Tracked follow-ups for the landing page and dashboard polish.

1. Extract reusable UI components

- Container, Button, SectionHeading from app/page.tsx into components/ui/
- Ensure tree-shakable and typed props, variants, focus styles

2. Scroll-reveal micro-interactions

- motion-safe reveal on section cards and hero content
- Prefer IntersectionObserver with reduced-motion guard

3. Replace placeholders with product visuals

- Hero 16:9 panel: real screenshots
- Optional: add subtle device frame mock

4. Metadata and branding

- Update metadata title/description in apps/web-dashboard/app/layout.tsx
- Replace OpenGraph image (apps/web-dashboard/app/opengraph-image.png) with branded version

5. Icons and visual accents

- Add small inline icons for value props
- Keep neutral palette and minimalist style

6. Accessibility and QA

- Audit landmarks/semantics
- Focus order/visible focus rings
- Contrast checks across light/dark
- Keyboard navigation on menus/buttons

7. Tests

- Component-level snapshot/behavior tests where practical
- i18n key existence checks for new sections

8. Documentation

- Add customization notes in apps/web-dashboard/README.md about theming, components, and i18n conventions
