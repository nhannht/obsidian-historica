import { mock } from "bun:test";
import moment from "moment";

mock.module("obsidian", () => ({
	moment,
}));
