## Historica 0.4.2

0.4.1 was tagged but never released. Its build failed, so no release was
ever published and this version carries its changes as well.

### Fixed
- **Releases publish again.** Two separate defects broke the 0.4.1 tag. The build installed `canvas`, an unused dependency with no prebuilt binary for the pinned Node version, so every run died in a native compile that needs libraries the CI image does not carry. And the workflow created each release as a draft, which no Obsidian client can see. Both are fixed, and the workflow now refuses to publish when the pushed tag disagrees with `manifest.json`.

### Changed
- **The plugin now carries the Historica brand mark.** Both ribbon buttons and all three view tabs (Timeline Sidebar, Global Timeline, Design Gallery) use the same mark as the website favicon, replacing the stock `calendar-clock`, `globe`, and `palette` icons.
- The mark is drawn in the theme's own text color rather than fixed colors, so it tracks light and dark themes and picks up hover and active states like every other icon in the ribbon. Its orange accent follows the `anchor` design token, which resolves to Orange 4 on light themes and Dark/Orange 6 on dark.

### Internal
- The brand mark is added to the Sketch design file as a reusable symbol, alongside dark and light renders and a size ramp, so the icon has one documented source instead of living only in code.
