# Historica marketing website

Landing page for the Obsidian Historica plugin. Vite + React + TypeScript +
Tailwind v4, with ReactBits components (GlassSurface, SpotlightCard, CountUp,
LogoLoop, ShinyText) pulled in via the shadcn registry.

```bash
bun install
bun run dev       # local dev server
bun run build     # tsc + vite production build -> dist/
bun run preview   # serve the production build locally
```

Design notes: Apple liquid-glass dark shell around a faithful Int UI dark
render of the plugin (tokens from the repo root DESIGN.md). The hero window's
timeline mock mirrors the plugin's entry card, date chip, precision gutter and
significance bars. `website/design/Historica.sketch` holds the earlier partial
Sketch exploration; the implementation is the source of truth.
