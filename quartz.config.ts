// @ts-ignore
import {QuartzConfig} from "./quartz/cfg"
// @ts-ignore
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
	configuration: {
		pageTitle: "HISTORICA",
		enableSPA: true,
		enablePopovers: true,
		// discussion: {
		// 	provider: "giscus",
		// 	configuration: {
		// 		dataRepo: "nhannht/obsidian-historica",
		// 		dataRepoId: "R_kgDOLWDFnQ",
		// 		dataCategory: "Comments from documents",
		// 		dataCategoryId: "DIC_kwDOLWDFnc4CfMtK",
		// 	}
		// },
		analytics: {
// @ts-ignore
			provider: null,
		},
		locale: "en-US",
		baseUrl: "https://nhannht.historica.pages.dev",
		ignorePatterns: ["private", "templates", ".obsidian"],
		defaultDateType: "created",
		theme: {
			fontOrigin: "googleFonts",
			cdnCaching: true,
			typography: {
				header: "Cinzel Decorative",
				body: "Lora",
				code: "Jetbrains Mono",
			},
			colors: {
				lightMode: {
					light: "#ffffff",
					lightgray: "#e5e5e5",
					gray: "#b8b8b8",
					darkgray: "#4e4e4e",
					dark: "#2b2b2b",
					secondary: "#ea1717",
					tertiary: "#84a59d",
					highlight: "rgb(250,231,234)",
				},
				darkMode: {
					light: "#161618",
					lightgray: "#393639",
					gray: "#646464",
					darkgray: "#d4d4d4",
					dark: "#ebebec",
					secondary: "#7b97aa",
					tertiary: "#84a59d",
					highlight: "rgba(143, 159, 169, 0.15)",
				},
			},
		},
	},
	plugins: {
		transformers: [
			Plugin.FrontMatter(),
			Plugin.CreatedModifiedDate({
				priority: ["frontmatter", "filesystem"],
			}),
			Plugin.Latex({renderEngine: "katex"}),
			Plugin.SyntaxHighlighting({
				theme: {
					light: "github-light",
					dark: "github-dark",
				},
				keepBackground: false,
			}),
			Plugin.ObsidianFlavoredMarkdown({enableInHtmlEmbed: false}),
			Plugin.GitHubFlavoredMarkdown(),
			Plugin.TableOfContents(),
			Plugin.CrawlLinks({markdownLinkResolution: "shortest"}),
			Plugin.Description(),
			Plugin.Latex({ renderEngine: "katex" }),
		],
		filters: [Plugin.RemoveDrafts()],
		emitters: [
			Plugin.AliasRedirects(),
			Plugin.ComponentResources(),
			Plugin.ContentPage(),
			Plugin.FolderPage(),
			Plugin.TagPage(),
			Plugin.ContentIndex({
				enableSiteMap: true,
				enableRSS: true,
			}),
			Plugin.Assets(),
			Plugin.Static(),
			Plugin.NotFoundPage(),
		],
	},
}

export default config
