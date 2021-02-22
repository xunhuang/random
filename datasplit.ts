const cheerio = require('cheerio');
import * as CloudDB from './CloudDB';
const fs = require('fs');
const path = require('path');

var argv = require('minimist')(process.argv.slice(2));

function usage() {
    console.log(`Usage:   program -t tablename -f splitby_field -o outputdir`);
}

async function doit() {
    let prefix = argv["o"] || ".";
    if (argv["t"] && argv["f"]) {
        let data = await CloudDB.getLastRecord(argv["t"]);
        let field = argv["f"]
        let dataobject = JSON.parse(data as string);
        let object = {};
        for (const line of dataobject) {
            let fieldname = line[field];
            let fielddata = object[fieldname] || [];
            fielddata.push(line);
            object[fieldname] = fielddata;
        }

        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                let json = await object[key];
                fs.writeFileSync(path.join(prefix, `${key}.json`), JSON.stringify(json, null, 2));
            }
        }
    } else {
        usage();
    }
}

doit().then(() => process.exit());