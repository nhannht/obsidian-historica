/**
 * The Historica brand mark, adapted for Obsidian's icon system.
 *
 * Derived from the website favicon (`website/public/favicon.svg`), which is a
 * 32px app-mark on a `#05070C` plate. Obsidian icons render transparent and in
 * the theme's `currentColor`, so the plate is dropped and the fills become
 * `currentColor` - otherwise the icon is a dark tile on light themes and the
 * navy pills vanish on dark ones.
 *
 * Kept from the favicon: the 3:1 node-to-spine ratio, the node/pill vertical
 * alignment, and the orange accent on the bottom node. Rescaled to fill ~84% of
 * the 100-unit box so it carries the same visual weight as the Lucide icons it
 * sits beside in the ribbon.
 *
 * Geometry is expressed with fills only - no strokes - so the mark is immune to
 * Obsidian's `--icon-stroke` variable, which would otherwise rescale a stroked
 * spine independently of the nodes.
 */

export const HISTORICA_ICON_ID = "historica-mark";

/**
 * Brand orange. `anchor` is a two-mode token, not one value - Orange 4 `#E56D17`
 * on light, Dark/Orange 6 `#E08855` on dark (DESIGN.md, "Status"). The favicon
 * hardcodes the dark tone because it sits on its own dark plate; this icon has
 * no plate and renders on both themes, so it reads the token instead and picks
 * up whichever mode is active.
 *
 * `--int-anchor` is declared on `:root` / `.dark` in `src/style/src.css`, both
 * global, and `darkModeAdapt()` mirrors Obsidian's `.theme-dark` onto
 * `body.dark`. The ribbon lives inside `body`, so the var resolves there too.
 * Fallback is the dark tone - Obsidian ships dark by default.
 */
const ACCENT = "var(--int-anchor, #E08855)";

export const HISTORICA_ICON_SVG = `
<rect x="22" y="20" width="8" height="60" rx="4" fill="currentColor" fill-opacity="0.3"/>
<circle cx="26" cy="20" r="12" fill="currentColor"/>
<circle cx="26" cy="50" r="12" fill="currentColor"/>
<circle cx="26" cy="80" r="12" fill="${ACCENT}"/>
<rect x="50" y="12" width="36" height="16" rx="8" fill="currentColor" fill-opacity="0.4"/>
<rect x="50" y="42" width="36" height="16" rx="8" fill="currentColor" fill-opacity="0.4"/>
<rect x="50" y="72" width="36" height="16" rx="8" fill="currentColor" fill-opacity="0.4"/>
`.trim();
