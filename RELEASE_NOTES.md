## Historica 0.4.1

### Changed
- **The plugin now carries the Historica brand mark.** Both ribbon buttons and all three view tabs (Timeline Sidebar, Global Timeline, Design Gallery) use the same mark as the website favicon, replacing the stock `calendar-clock`, `globe`, and `palette` icons.
- The mark is drawn in the theme's own text color rather than fixed colors, so it tracks light and dark themes and picks up hover and active states like every other icon in the ribbon. Its orange accent follows the `anchor` design token, which resolves to Orange 4 on light themes and Dark/Orange 6 on dark.

### Fixed
- **Releases build again.** The plugin's TypeScript config was type-checking `website/vite.config.ts`, a file belonging to the separate website sub-project with its own config. The resulting errors aborted the build chain before the bundler ran, so any tag push would have failed without producing `main.js`.

### Internal
- The brand mark is added to the Sketch design file as a reusable symbol, alongside dark and light renders and a size ramp, so the icon has one documented source instead of living only in code.
