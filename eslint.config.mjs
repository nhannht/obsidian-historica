// Reproduces the lint the Obsidian plugin directory runs against this repo, so
// findings can be fixed and verified locally instead of read off the portal.
// Rule ids here match the ones the portal reports (obsidianmd/*).
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	// `website/` is a separate Vite sub-project that ships nothing to the plugin.
	// Linting it as plugin source reports Obsidian API violations against code
	// that never runs inside Obsidian.
	globalIgnores([
		"website/**",
		"main.js",
		"styles.css",
		"docs/**",
		"__tests__/**",
		"historica-test-vault/**",
	]),
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
]);
