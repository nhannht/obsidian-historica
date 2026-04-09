// TS6 fix: obsidian's `moment` is typed as namespace (not callable),
// but at runtime it's the callable moment() function.
import {moment as _moment} from "obsidian";
import type _momentType from "moment";

export const moment = _moment as unknown as typeof _momentType;
