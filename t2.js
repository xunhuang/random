"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeNdJson = void 0;
var json_data = [{ A: 0.4612, B: 4.28283, C: -1.509, D: -1.1352 },
    { A: 0.5112, B: -0.22863, C: -3.39059, D: 1.1632 },
    { A: 0.6911, B: -0.82863, C: -1.5059, D: 2.1352 },
    { A: 0.4692, B: -1.28863, C: 4.5059, D: 4.1632 }];
function serializeNdJson(data) {
    var serializedList = [];
    for (var i = 0, len = data.length; i < len; i++) {
        serializedList.push(JSON.stringify(data[i]) + "\n");
    }
    return serializedList.join("");
}
exports.serializeNdJson = serializeNdJson;
var b = serializeNdJson(json_data);
console.log(b);
//# sourceMappingURL=t2.js.map