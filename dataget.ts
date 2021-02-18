const cheerio = require('cheerio');
import * as Email from './Email';
import * as MRUtils from './MapReduceUtils';
import * as CloudDB from './CloudDB';

var argv = require('minimist')(process.argv.slice(2));

function usage() {
    console.log(`Usage:   program -t tablename`);
}

async function doit() {
    if (argv["t"]) {
        let data = await CloudDB.getLastRecord(argv["t"]);
        console.log(data);
    } else {
        usage();
    }
}

doit().then(() => process.exit());
