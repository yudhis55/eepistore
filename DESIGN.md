# Design

EEPISTORE visual system. A product marketplace whose identity is derived from PENS (Politeknik Elektronika Negeri Surabaya): **navy as structure, gold as energy, engineering-grade precision as the aesthetic**. The register is _product with brand front_ — functional clarity leads, the campus identity is felt through committed color, type discipline, and schematic cues rather than decoration.

This follows the [Google Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/format/).

## Foundation

### Color

Color is committed, not decorative. Navy carries 30–60% of structural surfaces (header, primary CTAs, brand marks); gold is the ≤10% energy accent (verified badges, promo prices, active highlights). The body is a true neutral white/ink — **never warm cream** (an explicit anti-reference). Tinted neutrals lean toward the navy hue, not toward warmth-by-default.

All colors defined in OKLCH in `app/globals.css`; Tailwind token names mapped in `tailwind.config.ts`. The existing HSL token layer (`--primary`, `--secondary`, etc.) is the shadcn interface; the committed brand ramp (`brand.navy`, `brand.gold`, `neutral.*`) is the source of truth.

| Token              | Role                                | OKLCH                   | Tailwind                 |
| ------------------ | ----------------------------------- | ----------------------- | ------------------------ |
| `--brand-navy-900` | Primary — header, CTA, brand mark   | `oklch(0.32 0.12 256)`  | `brand-navy-900`         |
| `--brand-navy-700` | Primary hover/active                | `oklch(0.42 0.13 256)`  | `brand-navy-700`         |
| `--brand-gold-500` | Accent — badge, promo price, active | `oklch(0.82 0.16 75)`   | `brand-gold-500`         |
| `--brand-gold-300` | Accent soft — light hover           | `oklch(0.90 0.10 80)`   | `brand-gold-300`         |
| `--ink-900`        | Body text / headings                | `oklch(0.22 0.02 256)`  | `neutral-900`            |
| `--ink-500`        | Secondary text (≥4.5:1 verified)    | `oklch(0.50 0.02 256)`  | `neutral-500`            |
| `--surface-100`    | Card / section fill                 | `oklch(0.97 0.004 256)` | `neutral-100`            |
| `--surface-white`  | Page background                     | `oklch(1 0 0)`          | `surface` / `background` |
| `--success`        | Order complete                      | `oklch(0.62 0.15 152)`  | `success`                |
| `--warning`        | Pending payment                     | `oklch(0.74 0.15 70)`   | `warning`                |
| `--danger`         | Failed / cancelled                  | `oklch(0.58 0.19 27)`   | `danger`                 |

**Contrast contract (WCAG AA, verified):**

- Body `--ink-900` on `--surface-white`: ~16:1 ✓
- Secondary `--ink-500` on `--surface-white`: ~5.2:1 ✓ (never lighter than this for text)
- White on `--brand-navy-900`: ~9:1 ✓ — all navy CTAs use white text.
- Gold `--brand-gold-500` text is **never** used on white (fails AA at body size); gold is for fills/badges with navy or near-black ink, or as a bold ≥18px accent on navy.
- Status colors pair **color + label + icon** — never color alone (colorblind-safe). The Order Status Badge is the canonical pattern.

### Typography

One family, multiple weights — the PRD names Inter/Geist. Currently **Inter** (loaded via `next/font/google`, exposed as `--font-sans`). Hierarchy is built on weight + size, not a second decorative face. An optional monospace accent (`ui-monospace`) is reserved for numeric/technical strings (prices in admin tables, order IDs, stock counts) to reinforce the "engineered" register — used sparingly.

| Role                | Size (clamp)                           | Weight | Tracking | Tailwind       |
| ------------------- | -------------------------------------- | ------ | -------- | -------------- |
| Display / hero H1   | `clamp(2.25rem, 1.6rem + 2.8vw, 4rem)` | 700    | -0.03em  | `text-display` |
| H2 section          | `clamp(1.5rem, 1.2rem + 1.2vw, 2rem)`  | 700    | -0.02em  | `text-h2`      |
| H3                  | `1.25rem`                              | 600    | -0.01em  | `text-h3`      |
| Body                | `1rem` (16px)                          | 400    | 0        | `text-base`    |
| Body small          | `0.875rem`                             | 400    | 0        | `text-sm`      |
| Caption / meta      | `0.75rem`                              | 500    | 0.02em   | `text-xs`      |
| Price (mono accent) | `1rem–1.125rem`                        | 700    | 0        | `font-mono`    |

Rules:

- Body line length capped 65–75ch. `text-wrap: balance` on H1–H3, `text-wrap: pretty` on long prose.
- Display ceiling 4rem (64px) — under the global 6rem cap; this is a marketplace, not a billboard.
- Letter-spacing floor -0.04em respected (tightest is -0.03em).
- `lang="id"` set on `<html>`; Inter has full Latin coverage for Bahasa Indonesia.

### Spacing & Layout

A 4px base grid. Spacing uses Tailwind's scale; the committed values: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Rhythm varies — never uniform 16px gutters everywhere. Container is centered, `padding: 1rem`, max `2xl: 1280px` (already in `tailwind.config.ts`).

Responsive product grid: `repeat(auto-fit, minmax(280px, 1fr))` — no breakpoint-based card counts. Mobile drops to 2 columns via `minmax` naturally; the viewport decides.

Flexbox for 1D rows (navbars, toolbars, status rows); Grid only for true 2D layouts (dashboards, checkout summary). `flex-wrap` preferred over breakpoint Grid where it's simpler.

### Radius & Elevation

`--radius: 0.5rem` base (Tailwind `lg/md/sm` derive from it). Cards `rounded-lg`, buttons `rounded-md`, badges `rounded-sm`. No fully-pill rounding by default (it reads consumer-toy; the engineered register prefers a measured radius).

Elevation is restrained — the lazy card-with-shadow reflex is banned. Shadows reserved for _floating_ elements (dropdowns, modals, toasts, sticky bars on scroll). Static cards use a hairline border (`1px solid --border`) + the surface fill, not a drop shadow. Hover on an interactive card lifts to a single `shadow-md` — that is the only card shadow.

### Z-index scale (semantic)

```
--z-dropdown:  1000
--z-sticky:    1100
--z-backdrop:  1200
--z-modal:     1300
--z-toast:     1400
--z-tooltip:   1500
```

Never arbitrary `9999`. Dropdowns/popovers use the native Popover/`<dialog>` API or `position: fixed` to escape `overflow` clipping — never `absolute` inside an `overflow: hidden` parent.

### Motion

Intentional, exponential ease-out (`ease-out-quart`), no bounce/elastic. Existing keyframes (`fade-in 0.2s`, `slide-up 0.3s`) are the base vocabulary; extend with transform/opacity only (never animate layout properties). Skeleton loading over generic spinners (PRD requirement).

- Reveal animations **enhance already-visible content** — never gate visibility on a class-triggered transition (headless renderers and hidden tabs would ship blank).
- Stagger is legitimate within one list (product grid entrance), never a uniform reflex applied to every section.
- **Reduced motion is non-optional.** Every animation has a `@media (prefers-reduced-motion: reduce)` fallback (crossfade or instant).
- For richer motion (order lifecycle transitions, chat), reach for `motion` (Framer Motion) rather than hand-rolled keyframes.

## Components

Built on **Tailwind + shadcn/ui**, customized with the brand tokens above — never the default shadcn theme. Required components per PRD:

- **Product Card** — image (aspect-square), preloved/warning badge, name (2-line clamp), store name, price in mono navy. Hairline border + `shadow-md` on hover only. Link-wrapped.
- **Store Card** — store identity, verified badge (gold), rating, CTA to storefront.
- **Order Status Badge** — color + label + icon per status (Menunggu Pembayaran=warning, Diproses=navy, Dikirim=gold, Selesai=success, Dibatalkan/Gagal=danger). Colorblind-safe.
- **Empty State** — custom illustration, not stock. Each empty state drives the next action ("Belum ada produk — tambah produk pertamamu").
- **Dashboard Layout** — sidebar + topbar for Admin/Seller; responsive collapse to a bottom/side rail on mobile.
- **Search Bar** — prominent in navbar, mobile-accessible.
- **Form controls** — react-hook-form + Zod, descriptive error states, large tap targets (≥44px).

**Absolute bans (match-and-refuse):** side-stripe `border-left` accents, gradient `background-clip: text`, glassmorphism-as-default, the hero-metric template, identical icon-heading-text card grids, uppercase tracked eyebrows on every section, numbered `01/02/03` section scaffolding where order carries no information, text overflow at any breakpoint.

## Layout patterns

- **Public storefront** — full-bleed navy or photo hero with a single clear CTA, category rail, product grid, trust strip (verified campus community). No SaaS hero-metric template.
- **Product detail** — gallery + structured spec table (the "schematic" feel), seller card with verified badge, price + stock status, Add-to-Cart primary. Related products grid below.
- **Checkout** — single-column on mobile, summary-as-aside on desktop. Manual-transfer proof upload flow is a first-class path, not an afterthought.
- **Seller/Admin dashboard** — sidebar nav, topbar with role switcher + notifications, data tables with mono numerics, status badges. Hairline-divided rows, not nested cards.
- **Cart / Orders / Chat** — list-first, status-driven actions, empty states that onboard.

## Iconography & Imagery

Custom inline SVG icons at a consistent stroke weight (1.5px), matching the engineered aesthetic — no emoji as functional icons, no default outline-icon-set cliché. Product imagery is photographic (real items); empty-state and brand moments use custom schematic/iconographic illustration. **No stock 3D abstract illustrations** (PRD ban).

## Responsive & mobile-first

Mobile is the first target (shopping between classes on 4G). Every flow is thumb-reachable with primary actions in the lower thumb zone, ≥44px tap targets, and legible under classroom/outdoor ambient light (drives the ink/navy contrast choices). Breakpoints follow Tailwind defaults; the auto-fit grid means most layouts need no explicit breakpoint. Desktop is the secondary target.

## Theming

Light theme is primary. Dark mode is explicitly **deferred** (PRD: "opsional, bukan prioritas fase awal") — the token architecture (`darkMode: class`, `:root` HSL vars) is in place so a future dark theme is additive, not a rewrite. Do not design new components assuming dark mode exists yet.
