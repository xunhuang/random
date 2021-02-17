const cheerio = require('cheerio');
import * as CloudDB from './CloudDB';

const Storage = CloudDB.getStorageRef();
var ref = Storage.child('abc/text.text');
const fetch = require("node-fetch");

const dfd = require("danfojs-node");


/*
let a = require("./NJ15iQMsgoRumVCL6lKi.json")

let json_data = [{ A: 0.4612, B: 4.28283, C: -1.509, D: -1.1352 },
{ A: 0.5112, B: -0.22863, C: -3.39059, D: 1.1632 },
{ A: 0.6911, B: -0.82863, C: -1.5059, D: 2.1352 },
{ A: 0.4692, B: -1.28863, C: 4.5059, D: 4.1632 }];

// let df = new dfd.DataFrame(json_data);
let df = new dfd.DataFrame(a);
// df.sort_values({ by: "doses_administered", inplace: true })
// df.sort_values({ by: "fips", inplace: true })
// df.sort_values({ by: "county", inplace: true })

let grp = df.groupby(["county"]);
// grp.get_groups(["Alameda"]).print();
// df.print();

// grp.col(max(["doses_administered"]).print();
grp.col(['doses_administered']).max().print();

*/


function list_deep_dedup(list) {
    return list.reduce((r, i) =>
        !r.some(j => !Object.keys(i).some(k => i[k] !== j[k])) ? [...r, i] : r
        , [])
}

let a = [
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2, c: 2 },
]

let c = list_deep_dedup(a);
console.log(c);

console.log("hello!");
