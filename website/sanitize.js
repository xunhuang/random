const sanitizeHtml = require('sanitize-html');
const html = "<strong>hello world</strong>";
console.log(sanitizeHtml(html));

// Allow only a super restricted set of tags and attributes
const dirty = "<strong>hello world</strong> <script>yo!!!</script> <i>yo!!!</i> ";
const clean = sanitizeHtml(dirty, {
    disallowedTagsMode: 'discard',
    disallowedTags: ["script", "noscript"],

});
console.log(clean);