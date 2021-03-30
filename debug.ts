const cheerio = require('cheerio');
import * as Email from './website/src/Email';
import * as MRUtils from './MapReduceUtils';
import * as CloudDB from './website/src/CloudDB';

var argv = require('minimist')(process.argv.slice(2));


async function doit() {
    console.log(argv);
}

doit().then(() => process.exit());
