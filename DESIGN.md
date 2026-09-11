---
name: BabyWatch
description: La garde d'enfants en toute confiance — a sober, dark-navy trust console for booking and monitoring childcare.
colors:
  deep-night-navy: "#0f1923"
  slate-panel-navy: "#162030"
  dusk-card-navy: "#1e2d40"
  sunken-well: "#0c141d"
  signal-teal: "#2dd4bf"
  watch-amber: "#fbbf24"
  verified-green: "#4ade80"
  alert-coral: "#ff5f57"
  muted-lavender: "#a78bfa"
  soft-white: "#e8edf4"
  fog-gray: "#8b9bb0"
  faint-slate: "#5d6b7d"
  border-hairline: "rgba(255,255,255,0.07)"
  border-strong: "rgba(255,255,255,0.13)"
typography:
  display:
    fontFamily: "'Nunito', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Nunito', sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  section:
    fontFamily: "'Nunito', sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Inter', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "'Inter', sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "'Inter', sans-serif"
    fontSize: "0.7rem"
    fontWeight: 500
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  control: "10px"
  card: "14px"
  lg: "16px"
  panel: "20px"
  pill: "100px"
components:
  button-primary:
    backgroundColor: "{colors.signal-teal}"
    textColor: "{colors.deep-night-navy}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "rgba(255,255,255,0.06)"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "#ef444422"
    textColor: "#f87171"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  badge-status:
    backgroundColor: "{colors.signal-teal}22"
    textColor: "{colors.signal-teal}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  card:
    backgroundColor: "{colors.dusk-card-navy}"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.card}"
    padding: "20px 22px"
  input:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
---

# Design System: BabyWatch

## Overview

**Creative North Star: "The Night Watch"**

BabyWatch is used in the evening, on a phone, often one-handed — a parent checking a booking, glancing at a live feed, or messaging a sitter before bed. The interface reads as a calm, dim control surface built for that moment: a dark-navy console you can trust in low light, not a bright consumer app you browse in daylight. Warmth comes from clarity — legible information, correct states, honest empty states — never from decoration. The subject matter (children, allergies, medication, emergency contacts) rules out anything cute or playful; the small scale of the product today (a handful of real users, not thousands) rules out any dashboard bravado.

Two explicit anti-references keep this system honest: it must not read as a "young parents" app (pastels, balloons, child illustrations, bubbly rounded type), and it must not read as an infrastructure/ops dashboard (dense, purely operational, cold). The intended register sits closer to Doctolib or Qonto's sobriety than to Airbnb's warmth — trustworthy through precision, not through friendliness.

**Key Characteristics:**
- Near-black navy surfaces layered by tone, not by shadow
- One functional accent per role — teal for parent, amber for sitter — used sparingly, never decoratively
- Bold rounded-sans (Nunito) for structure and headings, neutral humanist-sans (Inter) for reading and data
- Flat by default; heavy shadow reserved strictly for modals lifting above the page
- Custom stroke-based SVG icon set for all functional/navigational icons — no emoji in that role
- Bilingual (FR/AR) with full RTL support; layouts must hold up mirrored

## Colors

The palette is a narrow set of navy surfaces plus five functional signal colors — nothing decorative, nothing used purely for variety.

### Primary
- **Signal Teal** (`#2dd4bf`): the parent role's accent and the app's primary action color — main CTAs, active parent-side tabs, the "parent" side of the role switcher, focus rings.

### Secondary
- **Watch Amber** (`#fbbf24`): the sitter role's accent — active sitter-side tabs, the "sitter" side of the role switcher, sitter-context buttons. Never used for parent-context UI, and never used as a generic warm accent unrelated to the sitter role.

### Tertiary
- **Muted Lavender** (`#a78bfa`): rare secondary accent for content that is neither parent- nor sitter-specific (used sparingly; do not let it compete with teal/amber for attention).

### Status
- **Verified Green** (`#4ade80`): success and "verified" states — confirmed bookings, verified sitters.
- **Alert Coral** (`#ff5f57`): destructive actions and warnings — cancel, delete, error banners (`#ef444420` background / `#f87171` text is the standard inline error-banner pairing).

### Neutral
- **Deep Night Navy** (`#0f1923`): app background — the darkest surface, the "room" everything else sits in.
- **Slate Panel Navy** (`#162030`): elevated surfaces — the top nav bar, modal chrome, active tab background.
- **Dusk Card Navy** (`#1e2d40`): content surface — the default `Card` background, one step up from panel.
- **Sunken Well** (`#0c141d`): recessed surfaces — code/technical detail blocks, the deepest well.
- **Soft White** (`#e8edf4`): primary text on dark surfaces.
- **Fog Gray** (`#8b9bb0`): secondary text. **Locked value** — chosen specifically for contrast on the dark surfaces; do not substitute a paler gray for this role.
- **Faint Slate** (`#5d6b7d`): tertiary/disabled text, least emphasis.

### Named Rules
**The Role Accent Rule.** Teal marks parent-context UI, amber marks sitter-context UI, everywhere — tabs, buttons, badges, role switchers. This mapping is binding; any exception is a bug, not a variant.

**The Restraint Rule.** Warmth and trust come from clarity, not from decoration. Do not introduce new saturated colors, brighter accents, or larger color fills to make a screen feel friendlier — that reads as the "young parents app" this system explicitly rejects. If a screen feels cold, fix it with better copy and hierarchy, not more color.

## Typography

**Display/Heading Font:** Nunito (weights 700/800/900), with a system sans-serif fallback.
**Body/UI Font:** Inter (weights 400/500/600), with a system sans-serif fallback.
**Technical/Debug Font:** monospace (rare — only the error-boundary's technical detail block).

**Character:** Nunito's rounded, heavy weights carry structure and brand moments (logo lockup, headings, buttons, tab labels) with quiet confidence; Inter stays neutral and highly legible for body copy, descriptions, and data-dense UI. The pairing is deliberately restrained — two families, no display-only novelty face — matching the system's sobriety.

### Hierarchy
- **Display** (800, 1.75rem, line-height 1.15, letter-spacing -0.02em): section/page-level headings inside the app. Marketing/landing headings run larger as one-off values (up to 3rem) and are a surface-specific exception, not part of this reusable scale.
- **Title** (700, 1.15rem, line-height 1.25, letter-spacing -0.01em): card/modal titles, sub-section headers.
- **Section** (600, 0.8rem, letter-spacing 0.02em): small structural labels.
- **Body** (400, 0.875rem, line-height 1.6): default reading text, form labels' associated copy.
- **Meta** (400, 0.78rem, line-height 1.5): secondary/supporting text — timestamps, counts, helper text.
- **Micro** (500, 0.7rem, letter-spacing 0.01em): the smallest tier — pill labels, badges, compact tab captions.

### Named Rules
**The Two-Voice Rule.** Nunito is structural (headings, buttons, tab labels, brand); Inter is everything read at length (body copy, descriptions, data). Don't use Nunito for paragraph text or Inter for a primary CTA label.

## Layout

The app shell uses a fixed top navigation bar (`60px` height, translucent panel-navy with a backdrop blur, `1px` hairline border beneath) rather than a bottom tab bar, containing: brand lockup + role indicator (left), page tabs (center, horizontally scrollable on narrow viewports), and account controls — name, language switcher, logout (right).

The public/marketing surface (landing page) uses a separate, wider grammar: a `1080px` max-width centered wrapper, a two-column hero (`1.1fr / 0.9fr`) collapsing to one column under `860px`, and 3-column feature/step grids collapsing to one column on mobile. This is a Persuade-mode container system, distinct from the in-app Operate-mode shell — don't conflate the two.

Spacing is not yet a named token scale in code; observed rhythm clusters around `6 / 8 / 10 / 12 / 16 / 20 / 22 / 24 / 28 / 32px`, with card internal padding at `20px 22px` and control (button/input) padding at `10px 14–20px`. Treat these clustered values as the de-facto scale until a formal spacing token is introduced.

RTL (Arabic) is applied at the document level: `direction` and `text-align` flip on `body` based on the active language, rather than per-component logical properties. Any new layout should verify it still reads correctly with this global flip rather than assuming LTR.

### Named Rules
**The Evening Thumb Rule.** Primary actions on mobile screens belong within comfortable one-handed thumb reach (lower-to-middle screen); don't place a screen's primary CTA only at the very top of a tall scrolling view.

## Elevation & Depth

The system is flat by default and conveys depth through **tonal layering + hairline borders**, not shadow: `Deep Night Navy` (background) → `Slate Panel Navy` (nav/elevated chrome) → `Dusk Card Navy` (content cards) → `Sunken Well` (recessed wells like code blocks). Every surface boundary is a `1px` `rgba(255,255,255,0.07)` border (`rgba(255,255,255,0.13)` for stronger separation), never a shadow.

Shadow is reserved exclusively for true overlays lifting off the page — modals and dialogs — where it signals "this is now floating above everything else."

### Shadow Vocabulary
- **Modal Lift** (`box-shadow: 0 24px 80px rgba(0,0,0,0.5)`): the standard modal/dialog elevation — the only shadow role in the system.
- **Toast Lift** (`box-shadow: 0 8px 32px rgba(0,0,0,0.4)`): lighter lift for the transient toast notification.
- **Media Frame Lift** (`box-shadow: 0 24px 60px rgba(0,0,0,0.5)`): used once, on the landing page's live-camera preview frame, to make it read as a floating device screen.

### Named Rules
**The Modal-Only Shadow Rule.** If it's not a modal, dialog, toast, or the landing page's camera-frame visual, it doesn't get a shadow — use layering + border instead.

## Shapes

Corners are soft and consistent but not decorative-round: `8px` for small chips/icon-buttons, `10px` for the workhorse controls (buttons, inputs, selects — the most common value in the codebase), `14px` for the default `Card`, `16–20px` for larger panels and modals, and `100px`/`50%` for pills (badges, role switcher, tags) and true circles (avatars). Don't push radii larger than what's already in this range to manufacture "friendliness" — see The Restraint Rule.

Borders are always `1px`, always the neutral hairline/strong border tokens — never a color border for decoration (color-coded borders only appear on interactive state, e.g. a selected role card or a focused input).

## Components

### Buttons (`Btn`)
- **Shape:** `10px` radius, no border by default (ghost/danger variants add a `1px` border).
- **Primary (teal):** `Signal Teal` background, `Deep Night Navy` text, Nunito 800. This is the default call-to-action.
- **Secondary variants:** `amber` (sitter-context primary action), `purple` (rare secondary), `ghost` (`rgba(255,255,255,0.06)` background, `1px` hairline border, soft-white text — the default "less important" action), `danger` (`#ef444422` background, `#f87171` text, `1px` `#f8717144` border — confirmed destructive actions).
- **Sizing:** `sm` (`8px 14px`, 0.78rem), `md` (`10px 20px`, 0.88rem — default), `lg` (`13px 28px`, 1rem).
- **States:** `0.18s` all-property transition; disabled state is `40%` opacity + not-allowed cursor. Hover/active states are not yet systematically defined in code beyond the base transition — a gap to close deliberately rather than improvise per-button.

### Badges (`Badge`, `StatusBadge`)
- **Style:** pill radius (`100px`), tinted background at the role/status color's `~13%` alpha (`color + "22"` hex suffix), `1px` border at `~27%` alpha (`color + "44"`), text in the full-opacity color. This "tinted pill" pattern is the system's one recurring decorative device — reuse it rather than inventing a new badge treatment.
- **Status mapping:** confirmed → green, pending → amber, completed → gray/muted, cancelled → coral.

### Cards (`Card`)
- **Corner Style:** `14px`.
- **Background:** `Dusk Card Navy`, `1px` hairline border.
- **Shadow Strategy:** none at rest (see Elevation & Depth) — depth comes from sitting one tone above the page background.
- **Internal Padding:** `20px 22px`.

### Inputs (`Input`)
- **Style:** `rgba(255,255,255,0.05)` background (a subtle sunken feel distinct from card surfaces), `1.5px` hairline border, `10px` radius, `10px 14px` padding (`10px 14px 10px 38px` when a leading icon is present).
- **Focus:** border shifts to `Signal Teal`, plus a `3px` teal glow ring at `~13%` alpha (`box-shadow: 0 0 0 3px #2dd4bf22`) — this is the system's one focus treatment; reuse it for any new focusable control rather than inventing another.
- **Error:** inline banner pattern — `#ef444420` background, `1px` `#ef444444` border, `#f87171` text, `8px` radius.

### Navigation
- **Top bar**, fixed, `60px` tall, `Slate Panel Navy` at `88%` opacity with backdrop blur, `1px` hairline bottom border.
- **Tabs:** icon (custom SVG, role-accent colored when active) + Inter label; active tab gets a subtle `rgba(255,255,255,0.06)` background pill and white text; inactive tabs are `Fog Gray` text with `Faint Slate` icons.
- **Role switcher** (accounts with both roles): a pill-shaped segmented control using the exact Role Accent Rule colors.
- **Icons:** a custom 24×24 stroke-based SVG set (`strokeWidth: 1.6`, round caps/joins) for every functional/navigational icon. Emoji are never used for navigation — that was deliberately replaced and must not be reintroduced. Emoji remain acceptable for decorative/illustrative moments elsewhere (empty states, role-selection cards, celebratory moments) — that's a distinct, already-accepted use, not an icon-system substitute.

## Do's and Don'ts

### Do:
- **Do** keep teal strictly on parent-context UI and amber strictly on sitter-context UI (The Role Accent Rule).
- **Do** use tonal layering (`night → panel → card → sunk`) plus hairline borders for depth; reserve shadow for modals, dialogs, and toasts only.
- **Do** use the custom SVG stroke-icon set for anything functional/navigational.
- **Do** verify any new layout against the RTL (Arabic) flip — content, alignment, and icon direction all need to hold up mirrored, not just translated.
- **Do** keep `Fog Gray` (`#8b9bb0`) exactly as specified for secondary text; it was tuned for contrast on these dark surfaces.
- **Do** let empty states stay genuinely empty (see PRODUCT.md's Evidence on Hand) — a well-designed empty state, not a fabricated one, is correct here.

### Don't:
- **Don't** add pastel colors, illustrated children, balloons, or bubbly/rounded-beyond-current-scale shapes to "warm up" a screen — that's the explicitly rejected "young parents app" direction.
- **Don't** go the opposite direction either — cold, purely operational, infrastructure-dashboard density has also been explicitly rejected. A parent is entrusting a child, not monitoring a server.
- **Don't** use emoji as functional or navigational icons; that pattern was deliberately replaced by the SVG icon set.
- **Don't** add a shadow to an at-rest surface (cards, panels, nav) — shadow is reserved for modals/dialogs/toasts only.
- **Don't** fabricate scale or social proof in any component (counters, testimonials, ratings) — PRODUCT.md's Evidence on Hand section governs this and it's a visual as well as content rule.
