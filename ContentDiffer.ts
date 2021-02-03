const cheerio = require('cheerio');
const equal = require('deep-equal');
const HtmlDiffer = require('html-differ').HtmlDiffer;
var jsonDiff = require('json-diff')

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
    function inverseGreen(text) { return `<b>${text}</b>` }
    function inverseRed(text) { return `<s>${text}</s>` }
    function grey(text) { return `<i>${text}</i>` }
    options = options || {
        charsAroundDiff: 40
    };

    var charsAroundDiff = options.charsAroundDiff,
        output = '';

    if (charsAroundDiff < 0) {
        charsAroundDiff = 40;
    }

    if (diff.length === 1 && !diff[0].added && !diff[0].removed) return output;

    diff.forEach(function (part) {
        var index = diff.indexOf(part),
            partValue = part.value,
            diffColor;

        if (part.added) diffColor = inverseGreen;
        if (part.removed) diffColor = inverseRed;

        if (diffColor) {
            output += (index === 0 ? '\n' : '') + diffColor(partValue);
            return;
        }

        if (partValue.length < charsAroundDiff * 2) {
            output += (index !== 0 ? '' : '\n') + grey(partValue);
        } else {
            index !== 0 && (output += grey(partValue.substr(0, charsAroundDiff)));

            if (index < diff.length - 1) {
                output += '\n...\n' + grey(partValue.substr(partValue.length - charsAroundDiff));
            }
        }
    });

    return output;
}

function html2text(html) {
    const stripped = cheerio.load(html).text()
        // .replace(/[ \t]+/g, ' ') // remove white spaces only, not line breaks
        // .replace(/(^[ \t]*\n)/gm, "") // remove empty lines
        .replace(/\s+/g, ' ') // remove white spaces and line breaks
        ;
    return stripped;
}

/* return null if two html pages are equal */
/* otherwise return a string that highlights the difference  */
export function diffHtmlPages(html1: string, html2: string): string | null {
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

/* return null if two json objects are equal */
/* otherwise return a string that highlights the difference  */
export function diffJsonObjects(html1: object, html2: object): string | null {
    if (equal(html1, html2)) {
        return null;
    }
    return jsonDiff.diffString(html1, html2);
}

export function isContentTheSame(c1: string | object, c2: string | object): boolean {
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