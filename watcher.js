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
var superagent = require('superagent');
var ContentDiffer = __importStar(require("./ContentDiffer"));
var Email = __importStar(require("./Email"));
var RandomDataTable_1 = require("./RandomDataTable");
var cheerio = __importStar(require("cheerio"));
var assert = require('assert');
var jq = require('node-jq');
var WebPageContentType;
(function (WebPageContentType) {
    WebPageContentType[WebPageContentType["UNKNOWN"] = 0] = "UNKNOWN";
    WebPageContentType[WebPageContentType["NULL"] = 1] = "NULL";
    WebPageContentType[WebPageContentType["HTML"] = 2] = "HTML";
    WebPageContentType[WebPageContentType["JSON"] = 3] = "JSON";
})(WebPageContentType || (WebPageContentType = {}));
function isJson(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}
var WebPageContent = /** @class */ (function () {
    function WebPageContent(content) {
        if (content === void 0) { content = null; }
        this.contentRaw = "";
        this.contentType = WebPageContentType.UNKNOWN;
        this.contentJsonObject = null;
        if (typeof content === "object") {
            this.contentType = WebPageContentType.JSON;
            this.contentRaw = JSON.stringify(content, null, 2);
            this.contentJsonObject = content;
        }
        else if (content === null) {
            this.contentType = WebPageContentType.NULL;
        }
        else {
            this.contentRaw = content;
            if (isJson(content)) {
                this.contentType = WebPageContentType.JSON;
                this.contentJsonObject = JSON.parse(content);
            }
            else {
                this.contentType = WebPageContentType.HTML;
            }
        }
    }
    WebPageContent.prototype.equal = function (other) {
        if (this.contentType != other.contentType) {
            return false;
        }
        if (this.contentType === WebPageContentType.JSON) {
            return ContentDiffer.isContentTheSame(this.contentJsonObject, other.contentJsonObject);
        }
        else if (this.contentType === WebPageContentType.NULL) {
            return other.contentType === WebPageContentType.NULL;
        }
        return ContentDiffer.isContentTheSame(this.contentRaw, other.contentRaw);
    };
    WebPageContent.prototype.diffContent = function (other) {
        if (this.contentType == WebPageContentType.HTML) {
            return ContentDiffer.diffHtmlPages(this.contentRaw, other.contentRaw);
        }
        if (this.contentType == WebPageContentType.JSON) {
            return ContentDiffer.diffJsonString(this.contentRaw, other.contentRaw);
        }
        if (this.contentType == WebPageContentType.NULL) {
            return other.contentRaw;
        }
        throw ("unknown content type");
    };
    WebPageContent.prototype.toString = function () {
        if (this.contentType === WebPageContentType.JSON) {
            return JSON.stringify(JSON.parse(this.contentRaw), null, 2);
        }
        if (this.contentType === WebPageContentType.NULL) {
            return "";
        }
        return this.contentRaw;
    };
    WebPageContent.prototype.isNull = function () {
        return this.contentType === WebPageContentType.NULL;
    };
    WebPageContent.prototype.cssSelect = function (query) {
        assert(this.contentType === WebPageContentType.HTML);
        var dom = cheerio.load(this.contentRaw);
        var content = dom(this.cssSelect).html();
        return new WebPageContent(content);
    };
    WebPageContent.prototype.jqQuery = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                assert(this.contentType === WebPageContentType.JSON);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        jq.run(query, _this.contentRaw, { input: 'string' }).then(function (x) { resolve(new WebPageContent(x)); });
                    })];
            });
        });
    };
    return WebPageContent;
}());
var Subscription = /** @class */ (function () {
    function Subscription(name, watchURL, emails, options) {
        if (options === void 0) { options = null; }
        this.contentType = "text";
        this.customHeaders = null;
        this.notifyEvenNothingNew = false;
        this.cssSelect = null;
        this.jqQuery = null;
        this.ignoreErrors = false;
        this.displayName = name;
        this.watchURL = watchURL;
        this.emails = emails;
        if (options) {
            for (var key in options) {
                this[key] = options[key];
            }
        }
        if (!this.storageTableName) {
            this.storageTableName = watchURL.replace(/\//g, "_");
        }
    }
    Subscription.prototype.setStoragePrefix = function (prefix) { this.storageTableName = prefix; };
    Subscription.prototype.setCustomHeader = function (headers) { this.customHeaders = headers; };
    Subscription.prototype.fetchContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, contentWeb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, scrape(this.watchURL, this.customHeaders)];
                    case 1:
                        content = _a.sent();
                        if (content === null) {
                            throw ("Scraped content is null");
                        }
                        contentWeb = new WebPageContent(content);
                        if (this.cssSelect) {
                            contentWeb = contentWeb.cssSelect(this.cssSelect);
                        }
                        if (!this.jqQuery) return [3 /*break*/, 3];
                        return [4 /*yield*/, contentWeb.jqQuery(this.jqQuery)];
                    case 2:
                        contentWeb = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, contentWeb];
                }
            });
        });
    };
    Subscription.prototype.getStorageTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, RandomDataTable_1.RandomDataTable.findOrCreate(this.storageTableName, {
                            sourceOperation: "Ingest",
                            displayName: this.displayName,
                            sourceTableName: this.watchURL,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Subscription.prototype.getLastRecord = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storageTable, record, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getStorageTable()];
                    case 1:
                        storageTable = _b.sent();
                        return [4 /*yield*/, storageTable.lastDataRecord()];
                    case 2:
                        record = _b.sent();
                        if (!record) {
                            return [2 /*return*/, new WebPageContent()];
                        }
                        _a = WebPageContent.bind;
                        return [4 /*yield*/, record.fetchData()];
                    case 3: return [2 /*return*/, new (_a.apply(WebPageContent, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    Subscription.prototype.saveRecord = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var storageTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStorageTable()];
                    case 1:
                        storageTable = _a.sent();
                        return [4 /*yield*/, storageTable.dataRecordAdd(content.toString())];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subscription.prototype.interestDetector = function (current, last) { return true; };
    Subscription.prototype.notificationContent = function (current, last) {
        if (current.contentType === WebPageContentType.JSON) {
            var c = JSON.stringify(current.contentJsonObject, null, 2);
            return "<pre>" + c + "</pre>";
        }
        return current.toString();
    };
    return Subscription;
}());
;
var NewSubscriptions = [
    new Subscription("JHU Current Realtime Cases data", "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases_US/FeatureServer/0/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(1%3D1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=OBJECTID%20ASC&resultOffset=0&resultRecordCount=4000&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22edit%22%7D", ["xhuang@gmail.com"], {
        storageTableName: "JHU-ESRI-Realtime2",
        jqQuery: "[.features  | .[] | .attributes]",
        contentType: "json",
    }),
    new Subscription("LA Times Vaccine Info", "https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/", ["xhuang@gmail.com"], {
        storageTableName: "California-Vaccine-2"
    }),
    new Subscription("NYS Covid Watcher", "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers", [], {
        contentType: "json",
        jqQuery: ".providerList",
        storageTableName: "NYC-Vaccines-New",
    }),
    new Subscription("CDC County Data", "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_latest_external_data", ["xhuang@gmail.com"], {
        storageTableName: "CDC-County-Data"
    }),
    new Subscription("CDC State Testing Data", "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=US_MAP_TESTING", ["xhuang@gmail.com"], {
        storageTableName: "CDC-State-Testing-Data"
    }),
    new Subscription("CDC State Vaccination Data", "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data", [], {
        storageTableName: "CDC-State-Vaccination-Data"
    }),
    new Subscription("CDC National Vaccination Trends", "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_trends_data", [], {
        storageTableName: "CDC-National-Vaccination-Trends"
    }),
    new Subscription("CDC Vaccination Demographic", "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_demographics_data", [], {
        storageTableName: "CDC-Vaccination-Demographic"
    }),
];
function scrape(url, customHeaders) {
    return __awaiter(this, void 0, void 0, function () {
        var request, key, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = superagent.get(url)
                        .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36');
                    if (customHeaders) {
                        for (key in customHeaders)
                            request.set(key, customHeaders[key]);
                    }
                    return [4 /*yield*/, request
                            .then(function (res) {
                            return res.text;
                        })];
                case 1:
                    body = _a.sent();
                    return [2 /*return*/, body];
            }
        });
    });
}
function processSubscription(sub) {
    return __awaiter(this, void 0, void 0, function () {
        function headers(input, content, last) {
            var diff;
            if (content && last) {
                diff = last.diffContent(content);
            }
            var html = "\n        <html>\n           <body>\n              <h4> Watch URL: " + sub.watchURL + "</h4>\n              " + (diff ? "<h4> Changes:  </h4>\n                       <pre> " + diff + " </pre> " : "") + "\n            <h4>Website Current Content </h4>\n            " + input + "\n            </body>\n        </html>\n            ";
            return html;
        }
        var content, last;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sub.fetchContent()];
                case 1:
                    content = _a.sent();
                    return [4 /*yield*/, sub.getLastRecord()];
                case 2:
                    last = _a.sent();
                    if (!!content.equal(last)) return [3 /*break*/, 10];
                    return [4 /*yield*/, sub.saveRecord(content)];
                case 3:
                    _a.sent();
                    if (!last.isNull()) return [3 /*break*/, 5];
                    return [4 /*yield*/, Email.send(sub.emails, sub.displayName + ": First run ", headers(sub.notificationContent(content, last), content, last))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 5:
                    if (!sub.interestDetector(content, last)) return [3 /*break*/, 7];
                    return [4 /*yield*/, Email.send(sub.emails, sub.displayName + ": interesting change detected", headers(sub.notificationContent(content, last), content, last))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, Email.send(sub.emails, sub.displayName + ": change detected but not interesting", headers(sub.notificationContent(content, last), content, last))];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    console.log("change not detected - no action");
                    if (!sub.notifyEvenNothingNew) return [3 /*break*/, 12];
                    return [4 /*yield*/, Email.send(sub.emails, sub.displayName + ": nothing new (but you asked me to send this)", headers(sub.notificationContent(content, last), content, last))];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12: return [2 /*return*/];
            }
        });
    });
}
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        var subs, errors, i, sub, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subs = NewSubscriptions;
                    errors = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < subs.length)) return [3 /*break*/, 6];
                    sub = subs[i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log(sub);
                    return [4 /*yield*/, processSubscription(sub)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    if (!sub.ignoreErrors) {
                        errors.push({
                            name: sub.displayName,
                            error: err_1.toString(),
                        });
                    }
                    console.log(err_1);
                    console.log("Error but soldier on....");
                    return [3 /*break*/, 5];
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    if (!(errors.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, Email.send(["xhuang@gmail.com"], errors.length + " from latest run", JSON.stringify(errors, null, 2))];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
doit().then(function () { return process.exit(); });
//# sourceMappingURL=watcher.js.map