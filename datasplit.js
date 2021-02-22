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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require('cheerio');
var CloudDB = __importStar(require("./CloudDB"));
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
function usage() {
    console.log("Usage:   program -t tablename -f splitby_field -o outputdir");
}
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        var prefix, data, field, dataobject, object, _i, dataobject_1, line, fieldname, fielddata, _a, _b, _c, key, json;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    prefix = argv["o"] || ".";
                    if (!(argv["t"] && argv["f"])) return [3 /*break*/, 6];
                    return [4 /*yield*/, CloudDB.getLastRecord(argv["t"])];
                case 1:
                    data = _d.sent();
                    field = argv["f"];
                    dataobject = JSON.parse(data);
                    object = {};
                    for (_i = 0, dataobject_1 = dataobject; _i < dataobject_1.length; _i++) {
                        line = dataobject_1[_i];
                        fieldname = line[field];
                        fielddata = object[fieldname] || [];
                        fielddata.push(line);
                        object[fieldname] = fielddata;
                    }
                    _a = [];
                    for (_b in object)
                        _a.push(_b);
                    _c = 0;
                    _d.label = 2;
                case 2:
                    if (!(_c < _a.length)) return [3 /*break*/, 5];
                    key = _a[_c];
                    if (!object.hasOwnProperty(key)) return [3 /*break*/, 4];
                    return [4 /*yield*/, object[key]];
                case 3:
                    json = _d.sent();
                    fs.writeFileSync(path.join(prefix, key + ".json"), JSON.stringify(json, null, 2));
                    _d.label = 4;
                case 4:
                    _c++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    usage();
                    _d.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
doit().then(function () { return process.exit(); });
//# sourceMappingURL=datasplit.js.map