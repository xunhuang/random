const cheerio = require('cheerio');
import * as Email from './Email';
import * as MRUtils from './MapReduceUtils';
import * as CloudDB from './CloudDB';

var argv = require('minimist')(process.argv.slice(2));


async function doit() {
    console.log(argv);
}

doit().then(() => process.exit());
