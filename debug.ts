const cheerio = require('cheerio');
import * as Email from './Email';
import * as MRUtils from './MapReduceUtils';
import * as CloudDB from './CloudDB';

async function doit() {
    console.log("hello world");
}

doit().then(() => process.exit());
