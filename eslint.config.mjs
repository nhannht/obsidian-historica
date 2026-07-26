// Reproduces the lint the Obsidian plugin directory runs against this repo, so
// findings can be fixed and verified locally instead of read off the portal.
// Rule ids here match the ones the portal reports (obsidianmd/*).
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	globalIgnores([
		"main.js",
		"styles.css",
		"docs/**",
		"__tests__/**",
		"test/**",
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
		rules: {
			// TypeScript already reports undefined identifiers, and it reports none
			// here. The base rule cannot see the global React namespace that
			// jsx: "react-jsx" relies on, so it flags every `React.` type annotation
			// in a file that correctly has no React import.
			"no-undef": "off",
		},
	},
]);
