# Product

## Register

product

## Users

EEPISTORE is a web marketplace for the **Politeknik Elektronika Negeri Surabaya (PENS)** academic community. Three roles, all civitas akademika:

- **Buyer (Mahasiswa Reguler)** — active PENS students buying academic supplies, electronics components, books, campus/himpunan merchandise, and preloved items from peers. Context: on mobile between classes, on a student budget, scanning listings quickly, deciding fast. Job: find what I need at a fair price from someone I can trust on campus, pay flexibly (manual transfer or COD), and meet up on campus to receive it.
- **Seller (Mahasiswa Penjual & UKM/Himpunan/UMKM Kampus)** — students and official campus units selling components, print/jilid services, preloved goods, or institutional merchandise. Context: managing a small side-business alongside coursework. Job: list products fast, manage stock and incoming orders, verify payments, track sales — without a steep learning curve. Official campus units additionally need recognizable branding and a verified badge.
- **Admin (Pengelola Platform)** — the platform operator (one person initially). Context: moderating from a laptop, handling approvals and disputes. Job: approve stores and student-badge verifications, moderate/takedown products, manage categories and homepage content, monitor transactions and audit sensitive actions.

Shared context: the UI is Bahasa Indonesia, mobile-first (most shopping happens on phones between classes on 4G), and trust between buyer and seller rests on knowing you share a campus — not on star ratings alone.

## Product Purpose

One centralized, structured, trustworthy place for the PENS community to buy and sell — replacing the scattered, unsearchable WhatsApp/Line/Instagram-per-angkatan status quo. It gives the campus an official platform that _looks_ like it belongs to PENS, with a transaction history and trust system (verified-student badge, ratings) the informal groups never had.

Success looks like: 50+ active sellers and 300+ listings within 3 months, 100+ completed transactions/month by month 2, >70% cart-to-completed-checkout rate, and a homepage that renders (LCP) under 2.5s on 4G. It is simultaneously a real-world workload for a DevSecOps pipeline (Terraform/AWS/CI-CD with security gates), so the codebase must stay clean, typed end-to-end, and modular.

## Brand Personality

**Precise. Helpful. Campus-proud.**

The voice is that of a competent engineering student running a tight, honest shop — not a hype marketplace, not a stuffy institution. Three-word personality: **precise, trustworthy, energetic**. Energy comes from the gold/amber accent (the electronics/energy signal in the PENS logo); precision and trust come from the navy and from a layout that respects the reader's time.

Emotional goals:

- **Confidence** — "this is a real PENS platform, my transaction is safe and auditable."
- **Clarity** — "I instantly understand the product, the price, the status, the next step." No clutter, no mystery.
- **Belonging** — "this is _my_ campus marketplace." The identity should feel native to PENS, not a generic skin.

The brand is carried by committed navy as the structural color, gold as the energetic accent, engineering-grade precision in the layout (grids, hairlines, schematic cues), and Bahasa Indonesia copy that is plain and direct.

## Anti-references

- **Generic SaaS purple/blue gradient slop.** No purple-blue gradients, no glassmorphism-as-default, no hero-metric template (big number + small label + gradient). The PRD explicitly bans "gradient ungu-biru generik." EEPISTORE's blue is _navy_, institutional and opaque — never a SaaS aurora.
- **Cluttered Shopee/Tokopedia maximalism.** No every-pixel-crammed promo badges, countdown timers, flashing vouchers, or density-for-its-own-sake. We choose breathing room and hierarchy over stimulation.
- **Boring default e-commerce template.** No flat, stock, lifeless layout with no hierarchy or brand voice. No identical icon-heading-text card grids repeated endlessly.
- **Warm magazine/editorial cream.** No cream/sand/paper/parchment near-white backgrounds with serif editorial warmth — wrong register entirely for an electronics-campus marketplace. Body is neutral white/ink, tinted only toward the brand's own navy hue, never toward warmth-by-default.
- **3D abstract template illustrations, default-font-no-hierarchy.** Banned by the PRD. Imagery is photographic (real products) or custom schematic/iconographic, never stock 3D blobs.

## Design Principles

1. **Precision is the personality.** The PENS identity is electronics and engineering. Layouts read like a well-made schematic: consistent grids, hairline rules, snapped alignment, status colors that mean something. Sloppy spacing or arbitrary values undermine the brand more than any color choice.
2. **Show the next action, always.** Every screen answers "what do I do next?" — order status drives the button, empty states drive onboarding, product state drives the affordance. A marketplace lives or dies on the buyer/seller knowing their next step without thinking.
3. **Trust through transparency, not decoration.** Verified badges, clear payment/proof flows, visible order lifecycle, and auditable admin actions earn more confidence than glossy effects. Surface the real state (stock, status, who verified what) plainly.
4. **Campus identity, not a skin.** Navy and gold are committed structural colors, not accent sprinkles. The platform should feel native to PENS the moment it loads — but earned through type, color discipline, and engineering cues, not by plastering a logo.
5. **Mobile-first is non-negotiable.** Most shopping happens on a phone between classes. Every flow is thumb-reachable, fast on 4G, and legible in ambient classroom/outdoor light. Desktop is the second target, never the first.

## Accessibility & Inclusion

**WCAG 2.1 AA baseline, with a strong mobile and inclusivity focus.**

- Contrast: all body text ≥4.5:1, large/bold text ≥3:1, against navy, white, and tinted-neutral backgrounds. Placeholder and muted text meet 4.5:1 — no washed-out gray on tinted near-white. The navy/ink end of the ramp is preferred over "elegant" light gray.
- Colorblind-safe status semantics: order and product status is never communicated by color alone — every color pairs with a label/icon (Order Status Badge). Success/warning/danger tokens are distinguishable for protanopia/deuteranopia, not just red/green.
- Full keyboard navigation and visible focus rings on every interactive element; semantic landmarks and headings for screen readers.
- Large, comfortable tap targets on mobile (minimum 44×44px); thumb-zone-aware placement of primary actions.
- Reduced motion: every animation has a `prefers-reduced-motion: reduce` alternative (crossfade or instant). Motion is enhancement, never a gate on content.
- Bahasa Indonesia UI throughout — plain, direct copy. Alt text on all product imagery. Form errors are descriptive and recoverable, not just "invalid."
