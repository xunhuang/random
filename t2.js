"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require('cheerio');
var CloudDB = __importStar(require("./CloudDB"));
var Storage = CloudDB.getStorageRef();
var ref = Storage.child('abc/text.text');
var fetch = require("node-fetch");
var dfd = require("danfojs-node");
var a = require("./NJ15iQMsgoRumVCL6lKi.json");
var json_data = [{ A: 0.4612, B: 4.28283, C: -1.509, D: -1.1352 },
    { A: 0.5112, B: -0.22863, C: -3.39059, D: 1.1632 },
    { A: 0.6911, B: -0.82863, C: -1.5059, D: 2.1352 },
    { A: 0.4692, B: -1.28863, C: 4.5059, D: 4.1632 }];
// let df = new dfd.DataFrame(json_data);
var df = new dfd.DataFrame(a);
// df.sort_values({ by: "doses_administered", inplace: true })
// df.sort_values({ by: "fips", inplace: true })
// df.sort_values({ by: "county", inplace: true })
var grp = df.groupby(["county"]);
var object = grp.col_dict;
for (var key in object) {
    if (object.hasOwnProperty(key)) {
        var element = object[key];
        grp.get_groups([key]).to_json().then(function (json) { return console.log(json); });
    }
}
// grp.get_groups(["Alameda"]).print();
// df.print();
//# sourceMappingURL=t2.js.map