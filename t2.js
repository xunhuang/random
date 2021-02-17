"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require('cheerio');
var CloudDB = require("./CloudDB");
var Storage = CloudDB.getStorageRef();
var ref = Storage.child('abc/text.text');
var fetch = require("node-fetch");
var dfd = require("danfojs-node");
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
    return list.reduce(function (r, i) {
        return !r.some(function (j) { return !Object.keys(i).some(function (k) { return i[k] !== j[k]; }); }) ? __spreadArrays(r, [i]) : r;
    }, []);
}
var a = [
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2, c: 2 },
];
var c = list_deep_dedup(a);
console.log(c);
console.log("hello!");
//# sourceMappingURL=t2.js.map