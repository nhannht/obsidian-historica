// @ts-ignore
import {PageLayout, SharedLayout} from "./quartz/cfg"
// @ts-ignore
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
	head: Component.Head(),
	header: [],
	footer: Component.Footer(
		{
			links: {
				"Source code": "https://github.com/nhannht/historica",
				"RSS": "https://historica.pages.dev/index.xml"
				,
			},
		}),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
	beforeBody: [
		Component.Breadcrumbs(),
		Component.ArticleTitle(),
		Component.ContentMeta(),
		Component.TagList(),
	],
	left: [
		Component.PageTitle(),
		Component.MobileOnly(Component.Spacer()),
		Component.Search(),
		Component.Darkmode(),
		Component.DesktopOnly(Component.Explorer()),
	],
	right: [
		Component.Graph(),
		Component.DesktopOnly(Component.TableOfContents()),
		Component.Backlinks(),
	],
	// footer: Component.Discussion()
	afterBody:[]


}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
	beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
	left: [
		Component.PageTitle(),
		Component.MobileOnly(Component.Spacer()),
		Component.Search(),
		Component.Darkmode(),
		Component.DesktopOnly(Component.Explorer()),
	],
	right: [],
	afterBody:[]
}
