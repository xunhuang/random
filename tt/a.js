// diff = require('node-htmldiff');
var cheerio = require("cheerio");
var fs = require('fs');

var HtmlDiffer = require('html-differ').HtmlDiffer;
var logger = require('html-differ/lib/logger');

var options = {
    ignoreAttributes: [],
    compareAttributesAsJSON: [],
    ignoreWhitespaces: true,
    ignoreComments: true,
    ignoreEndTags: false,
    ignoreDuplicateAttributes: false
};

var htmlDiffer = new HtmlDiffer(options);


var html1 = fs.readFileSync('a.html', "utf-8");
var html2 = fs.readFileSync('b.html', "utf-8");

// var t1 = cheerio.load(html1).text();
// var t2 = cheerio.load(html2).text();

// console.log(html2)

var diff = htmlDiffer.diffHtml(html1, html2);
// var diff = htmlDiffer.diffHtml(t1, t2);


// console.log(diff('<p>This is some text</p>', '<p>That is some more text</p>', 'myClass'));
// console.log(diff(contentA, contentB));

// console.log(t1);

//    $ = cheerio.load(html1);
//     const stripped = $.text()
//         .replace(/[ \t]+/g, ' ') // remove white spaces
//         .replace(/(^[ \t]*\n)/gm, "") // remove empty lines
//         ;
//     console.log(stripped);





// logger.logDiffText(diff, { charsAroundDiff: 40 });

a = `abc${$ } ab`


