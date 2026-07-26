## Historica 0.4.3

A maintenance release. Nothing changes in how the plugin behaves; what changed is what ships inside it. `main.js` is 192 KB smaller and `styles.css` is 37 KB smaller, and neither carries a React runtime, a dead editor library, or a marketing site's stylesheet any more.

### Fixed
- **Older Obsidian versions were offered a build they cannot run.** `versions.json` claimed 0.4.0 and 0.4.2 needed app version 0.2.4, and listed a 1.0.0 release that has never existed. The plugin actually needs 1.7.2. An app on an older version would either be sent after a download that is not there, or handed a build that fails to load. Every entry now states the version it really needs.
- The data-directory setting description and the block ID comment written into your notes both contained an em dash. The block ID line is rewritten on every save, so that character was landing in vault files.
- The source-file pill can be restyled by a theme or a CSS snippet now. Its look was set inline on the element, which overrides any stylesheet, and its hover state needed `!important` to get around that. Both are ordinary CSS rules now, and `styles.css` no longer contains `!important` anywhere.

### Changed
- **The plugin renders with Preact instead of React.** Same components, same behaviour; Preact is the smaller implementation of the same API, and it does not carry React's script-preloading machinery. That machinery was dead code the plugin never called, but it was still in every download, and it was the one hard error on the plugin directory's automated review. `main.js` drops from 1,420,949 to 1,224,121 bytes.
- **The Quill editor stylesheet is no longer a dependency.** The plugin stopped mounting that editor a while ago but still pulled the whole package in for its CSS, of which it used less than half. The rules that render existing entry content are now included directly, with Quill's licence notice. A package with an open security advisory leaves the tree.
- **`styles.css` no longer contains the marketing site's CSS.** Tailwind scans the project for class names, and the site used to live in this repository, so its utility classes were being generated into the plugin's stylesheet. Between that and the Quill change, `styles.css` drops from 62,844 to 24,651 bytes.
- Twenty-one packages nothing imported are gone: ten Radix UI components left over from before the UI was rewritten, the shadcn CLI, the Jest test stack the project replaced with bun's runner, and an SVG build plugin with no SVG to transform. Most of the advisories the directory review reported came through these.

### Internal
- Released assets now carry GitHub build provenance attestations, so anyone can verify a download was built from this repository: `gh attestation verify main.js --repo nhannht/obsidian-historica`.
- The marketing site moved to its own repository. The plugin directory scans a plugin repo whole and lints every file as plugin source, so a Vite app that ships nothing to the plugin was producing most of the review's warnings.
