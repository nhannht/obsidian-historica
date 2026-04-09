'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var WikilinksToMdlinks = /** @class */ (function (_super) {
    __extends(WikilinksToMdlinks, _super);
    function WikilinksToMdlinks() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WikilinksToMdlinks.prototype.onload = function () {
        var _this = this;
        console.log('loading wikilinks-to-mdlinks plugin...');
        this.addCommand({
            id: "toggle-wiki-md-links",
            name: "Toggle selected wikilink to markdown link and vice versa",
            checkCallback: function (checking) {
                var currentView = _this.app.workspace.getActiveLeafOfViewType(obsidian.MarkdownView);
                if ((currentView == null) || (currentView.getMode() !== 'source')) {
                    return false;
                }
                if (!checking) {
                    _this.toggleLink();
                }
                return true;
            },
            hotkeys: [{
                    modifiers: ["Mod", "Shift"],
                    key: "L"
                }]
        });
    };
    WikilinksToMdlinks.prototype.onunload = function () {
        console.log('unloading wikilinks-to-mdlinks plugin');
    };
    WikilinksToMdlinks.prototype.toggleLink = function () {
        var currentView = this.app.workspace.getActiveLeafOfViewType(obsidian.MarkdownView);
        var editor = currentView.sourceMode.cmEditor;
        var cursor = editor.getCursor();
        var line = editor.getDoc().getLine(cursor.line);
        var regexHasExtension = /^([^\\]*)\.(\w+)$/;
        var regexWiki = /\[\[([^\]]+)\]\]/;
        var regexParenthesis = /\((.*?)\)/;
        var regexWikiGlobal = /\[\[([^\]]*)\]\]/g;
        var regexMdGlobal = /\[([^\]]*)\]\(([^\(]*)\)/g;
        var wikiMatches = line.match(regexWikiGlobal);
        var mdMatches = line.match(regexMdGlobal);
        var ifFoundMatch = false;
        // If there are wikiMatches find if the cursor is inside the selected text
        var i = 0;
        if (wikiMatches) {
            for (var _i = 0, wikiMatches_1 = wikiMatches; _i < wikiMatches_1.length; _i++) {
                var item = wikiMatches_1[_i];
                var temp = line.slice(i, line.length);
                var index = i + temp.indexOf(item);
                var indexEnd = index + item.length;
                i = indexEnd;
                if ((cursor.ch >= index) && (cursor.ch <= indexEnd)) {
                    ifFoundMatch = true;
                    var text = item.match(regexWiki)[1];
                    // Check if it is a markdown file
                    var matches = text.match(regexHasExtension);
                    var newText = text;
                    if (matches) {
                        var filename = matches[1];
                        var extension = matches[2];
                    }
                    else {
                        newText = newText + ".md";
                    }
                    var encodedText = encodeURI(newText);
                    var newItem = "[" + text + "](" + encodedText + ")";
                    var cursorStart = {
                        line: cursor.line,
                        ch: index
                    };
                    var cursorEnd = {
                        line: cursor.line,
                        ch: indexEnd
                    };
                    editor.replaceRange(newItem, cursorStart, cursorEnd);
                }
            }
        }
        i = 0;
        if (ifFoundMatch == false) {
            if (mdMatches) {
                for (var _a = 0, mdMatches_1 = mdMatches; _a < mdMatches_1.length; _a++) {
                    var item = mdMatches_1[_a];
                    var temp = line.slice(i, line.length);
                    var index = i + temp.indexOf(item);
                    var indexEnd = index + item.length;
                    i = indexEnd;
                    if ((cursor.ch >= index) && (cursor.ch <= indexEnd)) {
                        ifFoundMatch = true;
                        var text = item.match(regexParenthesis)[1];
                        text = decodeURI(text);
                        // Check if it is a markdown file
                        var matches = text.match(regexHasExtension);
                        if (matches) {
                            var filename = matches[1];
                            var extension = matches[2];
                            if (extension == 'md') {
                                text = filename;
                            }
                        }
                        var newItem = "[[" + text + "]]";
                        var cursorStart = {
                            line: cursor.line,
                            ch: index
                        };
                        var cursorEnd = {
                            line: cursor.line,
                            ch: indexEnd
                        };
                        editor.replaceRange(newItem, cursorStart, cursorEnd);
                    }
                }
            }
        }
    };
    return WikilinksToMdlinks;
}(obsidian.Plugin));

module.exports = WikilinksToMdlinks;


/* nosourcemap */