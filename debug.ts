const cheerio = require('cheerio');

import * as CloudDB from './CloudDB';
import { helloWorld } from './functions/src';


async function doit() {
    let record = await CloudDB.getLastRecord("California-Vaccine");
    let dom = cheerio.load(record);
    let data = dom("#counties-vaccination-data").html();
    console.log(data);
    console.log("hello!");
    return;
}

console.log("hello! 1");
doit();

console.log("hello!2 ");