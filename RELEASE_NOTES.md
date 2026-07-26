## Historica 0.4.4

**This release requires Obsidian 1.13.0.** If you are on an older version, Obsidian will keep offering you 0.4.3, which is unaffected and needs only 1.7.2. Nothing is stranded.

### Changed
- **Settings are searchable.** The settings tab is now declared rather than hand-rendered, which is what lets Obsidian's settings search find "Date display format", "Parsing language" and "Data directory" instead of them being invisible to it. That API arrived in 1.13.0, and supporting both it and the old rendering path would have meant two descriptions of the same three settings kept in step by hand, so the floor moved instead.
- A blank date format or data directory is now refused with a message under the field. Before, a blank value was quietly swapped for the default, so the field looked empty while dates rendered in a format you had not chosen.

### Removed
- `bun run doc:code` and TypeDoc. It had been broken for some time - `typedoc-plugin-inline-sources` requires TypeDoc 0.28.x and the project pinned 0.27.9, so it crashed before writing anything - and it generated API documentation nobody read. The plugin and the marketing site are the two things this project ships.
- `postcss.config.js` and `tailwind.config.js`, both dead. Tailwind v4 does not read either without an `@config` directive, which this project does not have. Verified by rebuilding with each removed: `styles.css` came out byte-identical. Worth knowing if you ever read those files and believed them: `important: true` and the scoped preflight they configured were never in effect.
- The eight packages that existed only to serve those two files and TypeDoc: postcss, autoprefixer, tailwindcss-scoped-preflight, @tailwindcss/typography, typedoc and its three plugins.
- Two exported helpers in `utils.ts` with no callers, `GetAllDirInVault` and `GetAllHistoricaDataFile`.

### Fixed
- Dependency advisories are down from 13 to 1. Six had a fix available inside the same major version, so pinning them cost nothing: js-yaml, fast-uri, shell-quote (the one rated critical), markdown-it, linkify-it and postcss. None of these ever shipped to users - they are build and lint tooling - but they were noise hiding anything real.
- The last one, in brace-expansion, is left deliberately. Its fix only exists in a major version that changed the module's export shape, which breaks every consumer that calls it as a function, including ESLint. Pinning it makes the audit report zero and the toolchain throw. It is a denial of service reachable only by feeding a hostile glob pattern to your own linter.
