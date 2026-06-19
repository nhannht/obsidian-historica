---
version: alpha
name: Obsidian Historica
description: >-
  Design system for Obsidian Historica, a plugin that excavates timelines from
  prose. It is built on top of JetBrains' IntelliJ Platform "New UI" (Int UI)
  design kit: the Int ramps are the borrowed primitive layer (int-*), Historica
  semantic tokens alias them, and components reference the semantics. The look is
  a dense, calm, IDE-grade surface - Inter for UI, JetBrains Mono for dates, one
  blue accent, and precision/significance as the only ornament. Colors are
  hardcoded (a deliberate branded look rather than inheriting the host theme);
  the canonical token set is the Int UI light theme, with dark-theme values
  documented in the Colors section.
colors:
  # -- Layer 1: Int UI primitives (BORROWED, light theme; do not restyle) --
  int-blue-2: "#315FBD"
  int-blue-4: "#3574F0"
  int-blue-tint: "#EDF3FF"
  int-gray-2: "#27282E"
  int-gray-6: "#6C707E"
  int-gray-7: "#818594"
  int-gray-11: "#DFE1E5"
  int-gray-13: "#F7F8FA"
  int-gray-14: "#FFFFFF"
  int-orange-4: "#E56D17"
  int-orange-tint: "#FFF4EB"
  # -- Layer 2: Historica semantics (alias Int primitives) --
  primary: "{colors.int-blue-4}"
  accent-strong: "{colors.int-blue-2}"
  accent-tint: "{colors.int-blue-tint}"
  on-primary: "{colors.int-gray-14}"
  surface: "{colors.int-gray-14}"
  surface-secondary: "{colors.int-gray-13}"
  border: "{colors.int-gray-11}"
  on-surface: "{colors.int-gray-2}"
  on-surface-muted: "{colors.int-gray-6}"
  on-surface-faint: "{colors.int-gray-7}"
  anchor: "{colors.int-orange-4}"
  anchor-text: "#A14916"
  anchor-tint: "{colors.int-orange-tint}"
  danger: "{colors.int-orange-4}"
typography:
  ui-default:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 16px
  ui-semibold:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 16px
  ui-medium:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 19px
  date-mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-section:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.04em
  label-meta:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  pill: 12px
  full: 9999px
spacing:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  "2xl": 20px
  base: 8px
components:
  date-chip:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-strong}"
    typography: "{typography.date-mono}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  date-chip-approximate:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.date-mono}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  date-chip-anchor:
    backgroundColor: "{colors.anchor-tint}"
    textColor: "{colors.anchor-text}"
    typography: "{typography.date-mono}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  badge-manual:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-section}"
    rounded: "{rounded.xs}"
    padding: "1px 5px"
  badge-ref:
    backgroundColor: "{colors.anchor-tint}"
    textColor: "{colors.anchor-text}"
    typography: "{typography.label-section}"
    rounded: "{rounded.xs}"
    padding: "1px 5px"
  entry-card:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  toolbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  toolbar-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.ui-semibold}"
    padding: "5px 10px"
  toolbar-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.ui-medium}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  stat-pill:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-section}"
    rounded: "{rounded.xs}"
    padding: "1px 5px"
  hmd-card:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  hmd-title:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.title}"
  hmd-date-badge:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-meta}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  precision-gutter:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.xs}"
    width: 3px
  significance-dot:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 7px
  anchor-dot:
    backgroundColor: "{colors.anchor}"
    rounded: "{rounded.full}"
    size: 7px
  significance-track:
    backgroundColor: "{colors.on-surface-faint}"
    rounded: "{rounded.full}"
    height: 4px
  divider:
    backgroundColor: "{colors.border}"
    width: 1px
    height: 14px
  context-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.ui-default}"
    rounded: "{rounded.lg}"
    padding: "4px"
  context-menu-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.ui-default}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  context-menu-item-selected:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.ui-default}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  source-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.ui-medium}"
    padding: "1px 4px"
  status-banner:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.ui-default}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
---

# Obsidian Historica - Design System

## Overview

Historica is a temporal archaeologist, not a timeline builder. It reads prose the
user has already written and surfaces the chronology latent in the text. The UI is
a **lens**, not a canvas - dense, quiet, and precise.

This system is **built on JetBrains' IntelliJ Platform "New UI" (Int UI)** kit. We
borrow Int's primitive ramps and type system wholesale and add a thin Historica
layer on top. The result reads like a first-class IDE tool: a single blue accent,
a near-neutral gray scaffold, Inter for UI, JetBrains Mono for every date and
count.

It is built in three layers, and the discipline is in the layering:

```
LAYER 1  int-*   primitives   borrowed from Int UI; never restyled
                   │ alias
LAYER 2  historica semantics  primary, surface, on-surface, accent-strong, …
                   │ reference
LAYER 3  components           date-chip, entry-card, toolbar, hmd-card, …
```

Three product commitments still shape every decision:

- **Text authority** - the prose is the source of truth; chrome stays quiet.
- **Honest incompleteness** - coverage and unparsed counts are first-class, never
  hidden behind a confident UI.
- **Ambient restraint** - present during review, inert during writing; motion is
  short and functional (70-400ms), never decorative.

Colors are **hardcoded** by design: Historica adopts a deliberate branded look
instead of inheriting the user's Obsidian theme. The canonical tokens are the Int
UI **light** theme; dark values are documented below and become a second mode in
the Figma library.

## Colors

The palette is Int UI's. Layer 1 holds the borrowed primitives (`int-blue-4`,
`int-gray-13`, …); Layer 2 gives them Historica roles by aliasing.

Semantic roles and their Int source (light theme):

| Historica token     | Int primitive        | Hex       | Use |
|---------------------|----------------------|-----------|-----|
| `primary`           | Blue 4 (Primary)     | `#3574F0` | accent fills: precision gutter, significance dots, focus |
| `accent-strong`     | Blue 2               | `#315FBD` | accent **text** on light (links, date chips) and accent fills carrying white text (date badge, selected menu row) - the AA-safe accent tone |
| `accent-tint`       | Blue 12 (tint)       | `#EDF3FF` | date-chip / selected backgrounds |
| `surface`           | Gray 14 (White)      | `#FFFFFF` | primary surface |
| `surface-secondary` | Gray 13              | `#F7F8FA` | panels, cards, toolbars |
| `border`            | Gray 11              | `#DFE1E5` | hairline borders, dividers |
| `on-surface`        | Gray 2               | `#27282E` | primary text |
| `on-surface-muted`  | Gray 6               | `#6C707E` | secondary labels, controls (AA on surface) |
| `on-surface-faint`  | Gray 7               | `#818594` | decorative only (track fill, de-emphasized marks) - not body text |
| `anchor`            | Orange 4 (Primary)   | `#E56D17` | cross-vault anchor marker |
| `anchor-text`       | Orange (dark, AA)    | `#A14916` | anchor text on `anchor-tint` |
| `anchor-tint`       | Orange 9 (tint)      | `#FFF4EB` | anchor chip / ref-badge background |
| `danger`            | Orange 4             | `#E56D17` | error text / destructive markers (the Int kit ships no red) |

**Accent rule (WCAG AA).** Int's `Blue 4 #3574F0` is a mid-tone: white text on it
sits at ~4.3:1, just under AA, and so does the accent on a light tint. So `primary`
is used for **fills, strokes, and dots** (no contrast rule), while
`accent-strong` (Int Blue 2) carries any **accent text** and any **fill that holds
white text**. This is Int's own pattern - its links use Blue 2, not Blue 4.

**Status.** The imported Int kit ships only blue, gray, and orange ramps - no red or
green. Errors therefore use the `danger` token (Orange 4 `#E56D17` light, Dark/Orange 6
`#E08855` dark); there is no separate success color, and warnings/anchors share the
orange ramp. Used as text and markers, with darker tones where contrast needs it.

**Dark theme** (Int UI dark - becomes a second Figma mode):
`surface #1E1F22`, `surface-secondary #2B2D30`, `border #393B40`,
`on-surface #DFE1E5`, `on-surface-muted #9DA0A8`, `on-surface-faint #6F737A`,
`primary #3574F0` (accent text lightens to ~`#548AF7`), `danger #E08855`. In dark mode body, muted,
and anchor text stay AA-normal; the two short accent labels that ride Int's lighter
dark blue - the date chip (~3.9:1) and the selected menu row (~3.3:1) - meet WCAG
AA-large only. This is an accepted characteristic of Int's dark palette, kept to
preserve 1:1 Int alignment rather than retuned.

## Typography

Two families, straight from Int UI:

- **Inter** for all UI and body text - Int's default is Inter Medium 13/16, and we
  keep that as `ui-default`.
- **JetBrains Mono** for every date, count, and section label - the typographic
  signature. Dates are data, so they read as data.

The scale is small and dense (Int sizes 12-13 for controls), with `title` (16/600)
for HMD card headings and `body` (13/400, 19px line) for sentence prose. There is
**no serif** - the IDE aesthetic is sans + mono only (the previous serif voice was
dropped in the Int rebase).

## Layout

Spacing follows Int's 4/8 grid (`base 8px`): controls and chrome live in the 4-12px
range, cards pad to `8px 12px`, HMD reading cards to `16px 20px`. Structure is
vertical and spine-driven - a single timeline axis runs top to bottom, entries hang
off it as rows, and a 3px **precision gutter** tracks each entry on the left.
Toolbars are horizontal, collapsible, and wrap on narrow panes. The block, global,
and sidebar views reuse the same row/card primitives - one component, many mounts.

## Elevation & Depth

Flat by intent, exactly like an IDE. Hierarchy comes from **borders and the
surface / surface-secondary step**, not shadows. The only shadows are the soft
popup/menu lift Int uses for floating surfaces. Approximate entries invert the card
treatment - they drop their fill and use a **dashed** border to read as provisional
rather than solid. No stacked glows, no modal-over-modal depth theater.

## Shapes

Int's restrained radii: `sm (4px)` for controls (chips, buttons, inputs, menu
items), `md (6px)` for toolbars and cards, `lg (8px)` for popups, menus, and HMD
reading cards, `pill (12px)` for the date badge, `full` for significance dots and
timeline nodes. Strokes are `1px` hairlines in `border`; the precision gutter and
significance bars are the only deliberately heavier marks.

## Components

Every visible element is one shared React component rendered twice - in the
`src/ui/gallery/` showcase with mock data, and in production with real data. The
gallery is the implementation source of truth; this document is its token contract,
and the Int kit is the upstream visual source.

- **Date chip** (`date-chip`) - the atomic unit: a JetBrains Mono date in a tinted
  accent pill. Variants: `normal` (accent), `approximate` (muted, dashed, inferred
  years), `anchor` (orange, cross-vault refs).
- **Badges** - `badge-manual` ("MANUAL", user-tagged) and `badge-ref` ("REF",
  anchors).
- **Precision gutter** (`precision-gutter`) - a 3px accent bar whose **opacity
  encodes certainty**: `1.0` full (Y-M-D), `0.45` partial (year sure), `0.15`
  approximate (year inferred). Historica's most distinctive signal.
- **Significance** - a 1-5 scale: a slider on entries (`significance-track` +
  `significance-dot`) and five filter dots in the toolbar.
- **Entry card** (`entry-card`) - collapsed row (chip + preview + chevron) and an
  expanded card (chip row, collapse/jump/significance controls, content,
  annotation, source pill). Approximate entries render dashed and dimmed.
- **Toolbar** (`toolbar`) - collapsible header (`toolbar-label` + counts + save
  status), an optional stats row (`stat-pill`: dates / sentences / coverage), and a
  controls row (parse, sort, expand-all, show-hidden, significance filter, export,
  save).
- **HMD reading view** - `hmd-card`, `hmd-title`, `hmd-date-badge` render a saved
  timeline as a plain readable document even without the plugin.
- **Menus** - `context-menu` / `context-menu-item` (native, no Radix), with the
  Int-style blue **selected** row (`context-menu-item-selected`).
- **Honesty surfaces** - `status-banner`, `source-pill`, coverage/unparsed panels,
  loaders: they report what was and was not extracted.

## Do's and Don'ts

**Do**

- Treat `int-*` as upstream: extend by adding Historica semantics that alias them,
  never by restyling primitives in place.
- Keep dates, counts, and section labels in JetBrains Mono; everything else Inter.
- Use `accent-strong` (Int Blue 2) for any accent text or white-on-accent fill;
  reserve `primary` (Blue 4) for fills, gutters, and dots.
- Carry meaning with the precision gutter and significance before adding ornament.
- Surface coverage and unparsed counts honestly, even when unflattering.
- Keep motion short and functional (`micro 70ms`, `snap 110ms`, `reveal 150ms`,
  `sweep 400ms`).

**Don't**

- Don't ship JetBrains/IntelliJ logos, icon sets, or branding, or imply
  affiliation - borrow the token system, not the trademark.
- Don't put white or accent text on `primary` (Blue 4) fills at body size - it
  fails AA; use `accent-strong`.
- Don't introduce a second accent hue or gradients; one blue carries the identity.
- Don't use shadows for hierarchy; use borders and the surface step.
- Don't fabricate completeness - never hide a parse failure behind a confident UI.
- Don't animate for attention (no "On this day" nudges, no streaks).
