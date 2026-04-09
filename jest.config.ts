import type {Config} from 'jest'

const config: Config = {
	verbose: true,
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleDirectories: ["node_modules","src"],
	moduleNameMapper: {
		"^obsidian$": "<rootDir>/test/__mocks__/obsidian.ts",
	},
	roots: ["<rootDir>"],
	testMatch: ["**/__tests__/**/*.test.ts", "**/test/**/*.test.ts"],
	transform: {
		"^.+\\.tsx?$": ["ts-jest", {
			tsconfig: {
				rootDir: ".",
			},
		}],
	},
}
export default config

