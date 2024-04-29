import type {Config} from 'jest'

const config: Config = {
	verbose: true,
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleDirectories: ["node_modules","src"]

}
export default config

