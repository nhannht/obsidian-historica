## Historica 0.4.0

### Added
- **Per-entry metadata is now persisted.** Significance, annotation notes, date precision, and the manual / dismissed flags you set on a timeline entry are saved to the entry's HMD file and restored on reload.

### Changed
- **Refreshed visual design.** The entire UI now renders through the Int design-token system (the IntelliJ "New UI" palette), giving consistent light and dark theming across chips, badges, the annotation block, toolbar, menus, minimap, and all state views.
- **Annotations** render as an accent-tinted box instead of an amber left-border.
- **Typography** moved to Inter for UI text and JetBrains Mono for dates and code, with graceful fallbacks when those fonts are not installed.

### Fixed
- Hardcoded color leaks that ignored the theme: the annotation amber accent and the minimap white grips now follow the active theme.
- Invalid hand-edited `precision` values in HMD files are ignored on read instead of being stored.

### Internal
- Removed the unused shadcn token layer.
- Documented the HMD storage format (spec 1.1) and refreshed the README.
