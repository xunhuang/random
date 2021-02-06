"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContentTheSame = exports.diffJsonString = exports.diffJsonObjects = exports.diffHtmlPages = void 0;
var cheerio = require('cheerio');
var equal = require('deep-equal');
var HtmlDiffer = require('html-differ').HtmlDiffer;
var jsonDiff = require('json-diff');
var options = {
    ignoreAttributes: [],
    compareAttributesAsJSON: [],
    ignoreWhitespaces: true,
    ignoreComments: true,
    ignoreEndTags: false,
    ignoreDuplicateAttributes: false
};
/**
 * Returns readable diff text
 * @param {Diff[]} diff
 * @param {Object} [options]
 * @param {Number} [options.charsAroundDiff=40]
 * @returns {String}
 */
function getDiffText(diff, options) {
    function inverseGreen(text) { return "<b>" + text + "</b>"; }
    function inverseRed(text) { return "<s>" + text + "</s>"; }
    function grey(text) { return "<i>" + text + "</i>"; }
    options = options || {
        charsAroundDiff: 40
    };
    var charsAroundDiff = options.charsAroundDiff, output = '';
    if (charsAroundDiff < 0) {
        charsAroundDiff = 40;
    }
    if (diff.length === 1 && !diff[0].added && !diff[0].removed)
        return output;
    diff.forEach(function (part) {
        var index = diff.indexOf(part), partValue = part.value, diffColor;
        if (part.added)
            diffColor = inverseGreen;
        if (part.removed)
            diffColor = inverseRed;
        if (diffColor) {
            output += (index === 0 ? '\n' : '') + diffColor(partValue);
            return;
        }
        if (partValue.length < charsAroundDiff * 2) {
            output += (index !== 0 ? '' : '\n') + grey(partValue);
        }
        else {
            index !== 0 && (output += grey(partValue.substr(0, charsAroundDiff)));
            if (index < diff.length - 1) {
                output += '\n...\n' + grey(partValue.substr(partValue.length - charsAroundDiff));
            }
        }
    });
    return output;
}
function html2text(html) {
    var stripped = cheerio.load(html).text()
        // .replace(/[ \t]+/g, ' ') // remove white spaces only, not line breaks
        // .replace(/(^[ \t]*\n)/gm, "") // remove empty lines
        .replace(/\s+/g, ' ') // remove white spaces and line breaks
    ;
    return stripped;
}
/* return null if two html pages are equal */
/* otherwise return a string that highlights the difference  */
function diffHtmlPages(html1, html2) {
    var htmlDiffer = new HtmlDiffer(options);
    var t1 = html2text(html1);
    var t2 = html2text(html2);
    if (htmlDiffer.isEqual(t1, t2)) {
        return null;
    }
    var diff = htmlDiffer.diffHtml(t1, t2);
    var text = getDiffText(diff, { charsAroundDiff: 20 });
    return text;
}
exports.diffHtmlPages = diffHtmlPages;
/* return null if two json objects are equal */
/* otherwise return a string that highlights the difference  */
function diffJsonObjects(html1, html2) {
    if (equal(html1, html2)) {
        return null;
    }
    return jsonDiff.diffString(html1, html2);
}
exports.diffJsonObjects = diffJsonObjects;
/* return null if two json objects are equal */
/* otherwise return a string that highlights the difference  */
function diffJsonString(json1, json2) {
    var obj1 = JSON.parse(json1);
    var obj2 = JSON.parse(json2);
    return diffJsonObjects(obj1, obj2);
}
exports.diffJsonString = diffJsonString;
function isContentTheSame(c1, c2) {
    if (typeof c1 === "string" && typeof c2 === "string") {
        if (c1 === c2) {
            return true;
        }
        var htmlDiffer = new HtmlDiffer(options);
        if (htmlDiffer.isEqual(c1, c2)) {
            return true;
        }
        var t1 = html2text(c1);
        var t2 = html2text(c2);
        return htmlDiffer.isEqual(t1, t2);
    }
    // objects
    return equal(c1, c2);
}
exports.isContentTheSame = isContentTheSame;
//# sourceMappingURL=ContentDiffer.js.map