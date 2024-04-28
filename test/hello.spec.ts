import {describe, expect, it} from "@jest/globals";
import HistoricaPlugin from "../main";
import HistoricaUltility from "../src/backgroundLogic/HistoricaUtility";
import {App} from "obsidian";

describe('Basic jest', () => {
	it("1+1 should = 2", () => {
		const app = new App()
		//@ts-ignore
		const manifest = new PluginManifest()
		const historicaPlugin = new HistoricaPlugin(app, manifest)
		const historicaUtility = new HistoricaUltility(historicaPlugin)
		expect(historicaUtility).toBeTruthy()
	})

})
