/** @type {import('tailwindcss').Config} */
import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight';


module.exports = {

	darkMode: ["class"],
	content: ["./main.ts", "src/**/*.{ts,tsx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {},
	},
	plugins: [
		require('@tailwindcss/typography'),
		scopedPreflightStyles({
			isolationStrategy: isolateInsideOfContainer('.twp', {
				except: '.no-twp', // optional, to exclude some elements under .twp from being preflighted, like external markup
			}),
		})

	],
	corePlugins: {
		preflight: false,
	},
	important:true
};

