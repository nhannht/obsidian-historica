# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Obsidian Historica is an Obsidian.md plugin that generates timelines from note content using NLP date extraction. It parses markdown text, extracts sentences with dates via chrono-node, and renders interactive timeline visualizations. Desktop-only, English-focused.

## Build & Dev Commands

```bash
bun install               # Install dependencies
bun run dev               # Dev mode (concurrent CSS watcher + esbuild watcher)
bun run build             # Production build (minified CSS + tsc check + esbuild)
bun test                  # Run Jest tests (jsdom environment)
bun run doc:code          # Generate TypeDoc documentation
```

The build produces three artifacts: `main.js`, `styles.css`, and `manifest.json`.

## QA Testing (Obsidian CLI)

The test vault is at `historica-test-vault/`. QA uses the `obsidian` CLI which communicates with a running Obsidian instance over a local socket. Obsidian must be running (headless via Xvfb on servers).

### Setup

```bash
# Start Obsidian headless (if not running)
Xvfb :99 -screen 0 1920x1080x24 &
DISPLAY=:99 /opt/Obsidian/obsidian --no-sandbox &
# Wait ~5 seconds for startup
```

### Build → Deploy → Reload Cycle

```bash
bun run build
cp main.js styles.css manifest.json historica-test-vault/.obsidian/plugins/historica/
obsidian plugin:reload vault=historica-test-vault id=historica
```

### Visual Verification

```bash
# Take screenshot (view with Read tool)
obsidian dev:screenshot path=/tmp/historica-qa.png

# Query DOM to verify timeline rendered
obsidian dev:dom selector=".historica-timeline" text
obsidian dev:dom selector=".historica-timeline" all    # all matches

# Inspect CSS
obsidian dev:css selector=".historica-timeline" prop=display
```

### Error Checking

```bash
obsidian dev:console level=error    # JS console errors
obsidian dev:errors                 # captured runtime errors
obsidian dev:console                # all console output
obsidian dev:console clear          # clear buffer
```

### Test Note Management

```bash
# Create a note with a historica block
obsidian create vault=historica-test-vault name="qa-test" content="..." overwrite
obsidian open vault=historica-test-vault file="qa-test"
obsidian read vault=historica-test-vault file="qa-test"
```

### Advanced (Chrome DevTools Protocol)

```bash
# Execute arbitrary JS in Obsidian
obsidian eval code="document.querySelectorAll('.historica-timeline').length"

# Raw CDP commands
obsidian dev:cdp method="Runtime.evaluate" params='{"expression":"1+1"}'
```

## Architecture

### Data Flow

1. **Block Registration**: `main.ts` -> `HistoricaBlockManager` registers a markdown code block processor for historica blocks
2. **Store Creation**: `HistoricaBlockManager` creates a per-block Zustand store via `createTimelineStore()`, passing plugin, settings, and block context
3. **Data Loading**: Store `load()` action reads saved JSON from `historica-data/{blockId}.json` or parses the current file via the compute layer
4. **Content Extraction**: `src/compute/MarkdownParser.ts` uses remark/unified to parse markdown AST, then natural.js to tokenize sentences
5. **Date Parsing**: `src/compute/ChronoParser.ts` wraps chrono-node with custom parsers (YYYY/MM/DD, B.C.E/A.D.E patterns, etc.)
6. **Rendering**: `src/ui/TimelineBlock.tsx` consumes the store via `useStore()` and renders TimelineI
7. **Persistence**: Auto-save via `store.subscribe()` writes to `historica-data/{blockId}.json` on state change. Manual save assigns blockId if not set.

### Key Entry Points

- **`main.ts`**: Plugin class (`HistoricaPlugin`) -- registers block processor, handles dark mode
- **`src/backgroundLogic/HistoricaBlockManager.tsx`**: Block processor -- parses settings, creates Zustand store, mounts React
- **`src/store/createTimelineStore.ts`**: Zustand store factory -- all state and actions (add/remove/edit/sort/expand/save/parse/import)
- **`src/data/TimelineDataManager.ts`**: Vault I/O layer -- load/save JSON, ensure blockId, import from file
- **`src/compute/MarkdownParser.ts`**: Markdown to sentences extraction pipeline
- **`src/compute/ChronoParser.ts`**: Date/time NLP parsing with custom chrono-node parsers
- **`src/ui/TimelineBlock.tsx`**: Top-level React component -- context menu, loading/error/empty states
- **`src/types.ts`**: All type definitions (`HistoricaSettingNg`, `PlotUnitNg`, `HistoricaFileData`, `TimeData`, `Attachment`)
- **`src/utils.ts`**: Utility functions (export to JSON/PNG/MD, vault helpers, HTML sanitization)

### File Structure

```
main.ts                              -- plugin entry
src/
  types.ts                           -- all type definitions + DefaultSettings
  utils.ts                           -- utility functions
  moment-fix.ts                      -- moment type shim
  data/
    TimelineDataManager.ts           -- vault I/O for timeline data
  compute/
    MarkdownParser.ts                -- markdown AST to sentences
    ChronoParser.ts                  -- chrono-node date extraction
  store/
    createTimelineStore.ts           -- Zustand store factory (per-block)
  backgroundLogic/
    HistoricaBlockManager.tsx        -- code block processor
  ui/
    TimelineBlock.tsx                -- top-level React component
    TimelineI.tsx                    -- timeline visualization
    SinglePlotUnit.tsx               -- individual plot unit card
    SinglePlotUnitEditor.tsx         -- rich text editor for units
    HeaderAndFooterEditor.tsx        -- header/footer editor
    TimelineGeneral.tsx              -- Content + AttachmentPlot
    ImageFromPath.tsx                -- image loader
    AttachmentEditor.tsx             -- attachment management
    ShortendableParagraph.tsx        -- text truncation
    shadcn/                          -- shadcn/ui components
  style/                             -- CSS
```

### UI Layer

- React 19 with shadcn/ui components (`src/ui/shadcn/`) built on Radix UI primitives
- Zustand for state management -- each block gets its own store instance
- Rich text editing via react-quill-new (`SinglePlotUnitEditor.tsx`, `HeaderAndFooterEditor.tsx`)
- TailwindCSS with scoped preflight to avoid leaking styles into Obsidian
- Context menus for per-unit and global timeline operations
- HTML sanitization via `sanitizeHtml()` on all rendered HTML content

## Obsidian API Documentation (Context7)

Before writing code that touches Obsidian APIs, use Context7 MCP to fetch current docs — don't rely on training data.

| Library ID | Snippets | Use for |
|---|---|---|
| `/websites/obsidian_md_plugins` | 378 | Plugin dev guides, best practices, lifecycle |
| `/obsidianmd/obsidian-api` | 50 | API type definitions, method signatures |
| `/obsidianmd/obsidian-developer-docs` | 2090 | Comprehensive developer docs |

**Usage**: `resolve-library-id` is not needed — use these IDs directly:
```
mcp__context7__query-docs(libraryId: "/websites/obsidian_md_plugins", query: "your question")
```

**When to query**: Before using `registerMarkdownCodeBlockProcessor`, `Plugin` lifecycle hooks, `Vault`/`Workspace` APIs, `MarkdownPostProcessorContext`, `Editor` interface, or any Obsidian API you're not 100% sure about.

## Build System

- **Bundler**: esbuild (`esbuild.config.mjs`) — outputs CommonJS `main.js`
- **CSS**: TailwindCSS 3 with `tailwindcss-scoped-preflight` to isolate styles
- **TypeScript**: Strict mode, ES6 target, path alias `@/*` → project root
- **SVG**: Imported as React components via `esbuild-plugin-svgr`
- **Externals**: `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`

## Release Process

Git tag push triggers `.github/workflows/release.yml`: generates changelog via git-cliff, builds, creates GitHub release with `main.js`, `manifest.json`, `styles.css`.

## Code Editing Tools (MANDATORY)

**CRITICAL: For ALL code files, you MUST use Serena MCP and JetBrains MCP tools instead of built-in Read/Edit/Grep/Write. Built-in tools are ONLY for non-code files (markdown, PDFs, JSON config, etc.).**

The projectPath for all JetBrains calls is `/home/ubuntu/nhannht-projects/obsidian-historica`.

### Tool Split: Serena = Code Intelligence, JetBrains = IDE Capabilities

**Serena is primary for all code reading, searching, navigating, and editing.** JetBrains MCP is used ONLY for IDE-level capabilities that Serena cannot provide. Do NOT use JetBrains tools for search/read/find when Serena covers it — this avoids tool overlap confusion and context waste.

### Serena Tools (use these for code work)

| Action | Tool |
|---|---|
| See what's in a code file | `mcp__serena__jet_brains_get_symbols_overview` |
| Read a specific function/class body | `mcp__serena__jet_brains_find_symbol` with `include_body=true` |
| Search code for a pattern | `mcp__serena__search_for_pattern` |
| Find files by name | `mcp__serena__find_file` |
| Replace a function/method body | `mcp__serena__replace_symbol_body` |
| Add code after a symbol | `mcp__serena__insert_after_symbol` |
| Add code before a symbol | `mcp__serena__insert_before_symbol` |
| Rename a symbol project-wide | `mcp__serena__rename_symbol` |
| Find who references a symbol | `mcp__serena__jet_brains_find_referencing_symbols` |
| Check type hierarchy | `mcp__serena__jet_brains_type_hierarchy` |

**Serena gotcha - `replace_symbol_body` duplicates `export`:**
Serena includes the symbol signature in the `body` param but does NOT remove the original `export const` prefix. After every `replace_symbol_body` call, immediately fix with `replace_text_in_file("export const export const", "export const")`.

### JetBrains Tools (use ONLY for unique IDE capabilities)

| Action | Tool |
|---|---|
| Build/compile and get errors | `mcp__jetbrains__build_project` |
| Check file errors/warnings (IntelliJ inspections) | `mcp__jetbrains__get_file_problems` |
| Run custom inspection scripts | `mcp__jetbrains__run_inspection_kts` |
| Get inspection KTS API/examples | `generate_inspection_kts_api`, `generate_inspection_kts_examples` |
| Generate PSI tree | `mcp__jetbrains__generate_psi_tree` |
| Run IDE run configurations | `mcp__jetbrains__execute_run_configuration` |
| List run configurations | `mcp__jetbrains__get_run_configurations` |
| Quick Documentation at cursor | `mcp__jetbrains__get_symbol_info` |
| Read file with indentation mode | `mcp__jetbrains__read_file` (mode=indentation) |
| Small text replacement in file | `mcp__jetbrains__replace_text_in_file` |
| Create a new code file | `mcp__jetbrains__create_new_file` |
| Format a file | `mcp__jetbrains__reformat_file` |
| Open file in IDE editor | `mcp__jetbrains__open_file_in_editor` |
| Run shell in IDE terminal | `mcp__jetbrains__execute_terminal_command` |
| List project modules/deps/repos | `get_project_modules`, `get_project_dependencies`, `get_repositories` |
| Run Jupyter notebook cells | `mcp__jetbrains__runNotebookCell` |

**DO NOT use these JetBrains tools** (Serena already covers them):
`search_text`, `search_regex`, `search_symbol`, `search_file`, `search_in_files_by_text`, `search_in_files_by_regex`, `find_files_by_glob`, `find_files_by_name_keyword`, `get_file_text_by_path`, `rename_refactoring`.

**Always pass `projectPath`:**
```
projectPath="/home/ubuntu/nhannht-projects/obsidian-historica"
```

### Decision flowchart

1. **Need to understand a code file?** → Serena `get_symbols_overview` first, then `find_symbol` with `include_body=true`
2. **Need to edit a function/component?** → Serena `find_symbol` to read, then `replace_symbol_body` to rewrite
3. **Need to add new code?** → Serena `insert_after_symbol` or `insert_before_symbol`
4. **Need to rename?** → Serena `rename_symbol`
5. **Need to find usages?** → Serena `find_referencing_symbols`
6. **Need to search code?** → Serena `search_for_pattern`
7. **Need to check errors?** → JetBrains `get_file_problems` (per file) or `build_project` (whole project)
8. **Need Quick Documentation?** → JetBrains `get_symbol_info`
9. **Need to run tests/builds?** → JetBrains `execute_run_configuration` or `build_project`
10. **Need custom code analysis?** → JetBrains `run_inspection_kts`
11. **Non-code file?** → Use built-in Read/Edit/Write tools
