"use strict";
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
var ContentDiffer = require("./ContentDiffer");
var Email = require("./Email");
var CloudDB = require("./CloudDB");
var cheerio = require("cheerio");
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
    return WebPageContent;
}());
var Subscription = /** @class */ (function () {
    function Subscription(name, watchURL, emails, options) {
        if (options === void 0) { options = null; }
        this.contentType = "text";
        this.customHeaders = null;
        this.notifyEvenNothingNew = false;
        this.cssSelect = null;
        this.ignoreErrors = false;
        this.name = name;
        this.watchURL = watchURL;
        this.storageTableName = watchURL.replace(/\//g, "_");
        this.emails = emails;
        if (options) {
            if (options.contentType)
                this.contentType = options.contentType;
            if (options.customHeaders)
                this.customHeaders = options.customHeaders;
            if (options.notifyEvenNothingNew)
                this.notifyEvenNothingNew = options.notifyEvenNothingNew;
            if (options.storageTableName)
                this.storageTableName = options.storageTableName;
            if (options.cssSelect)
                this.cssSelect = options.cssSelect;
            if (options.ignoreErrors)
                this.ignoreErrors = options.ignoreErrors;
        }
    }
    Subscription.prototype.setStoragePrefix = function (prefix) { this.storageTableName = prefix; };
    Subscription.prototype.setCustomHeader = function (headers) { this.customHeaders = headers; };
    Subscription.prototype.fetchContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, dom;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, scrape(this.watchURL, this.customHeaders)];
                    case 1:
                        content = _a.sent();
                        if (this.cssSelect && typeof content == "string") {
                            dom = cheerio.load(content);
                            content = dom(this.cssSelect).html();
                        }
                        if (content === null) {
                            throw ("Scraped content is null");
                        }
                        return [2 /*return*/, new WebPageContent(content)];
                }
            });
        });
    };
    Subscription.prototype.getLastRecord = function () {
        return __awaiter(this, void 0, void 0, function () {
            var last;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CloudDB.getLastRecord(this.storageTableName)];
                    case 1:
                        last = _a.sent();
                        return [2 /*return*/, new WebPageContent(last)];
                }
            });
        });
    };
    Subscription.prototype.getFirstRecord = function () {
        return __awaiter(this, void 0, void 0, function () {
            var last;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CloudDB.getFirstRecord(this.storageTableName)];
                    case 1:
                        last = _a.sent();
                        return [2 /*return*/, new WebPageContent(last)];
                }
            });
        });
    };
    Subscription.prototype.saveRecord = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CloudDB.saveInfoAtSystem(this.storageTableName, content.toString())];
                    case 1:
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
    new Subscription("NYS Covid Watcher", "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers", ["xhuang@gmail.com"], {
        contentType: "json",
    }),
    new Subscription("Stanford Hospital", "https://stanfordhealthcare.org/discover/covid-19-resource-center/patient-care/safety-health-vaccine-planning.html", ["xhuang@gmail.com"]),
    // new Subscription(
    //     "Hacker News",
    //     "https://news.ycombinator.com",
    //     ["xhuang@gmail.com"],
    // ),
    new Subscription("LA Times Vaccine Info", "https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/", ["xhuang@gmail.com"], {
        storageTableName: "California-Vaccine"
    }),
    new Subscription("Alameda County Vaccine Hospital", "https://covid-19.acgov.org/vaccines", ["xhuang@gmail.com"], {
        customHeaders: {
            'user-agent': 'curl/7.64.1',
        },
    }),
    new Subscription("Bloomberg Vaccine Data", "https://www.bloomberg.com/graphics/covid-vaccine-tracker-global-distribution/", ["xhuang@gmail.com"], {
        customHeaders: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
            'authority': 'www.bloomberg.com',
            'cache-control': 'max-age=0',
            'sec-ch-ua': '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
            'sec-ch-ua-mobile': '?0',
            'upgrade-insecure-requests': '1',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'none',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document'
        },
        cssSelect: "#dvz-data-cave",
        storageTableName: "Bloomberg 2"
    }),
];
/*
        interestDetector: (current, last) => {
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );
            return goodlist.length > 0;
        },
        notificationContent: (current, last) => {
            function pretty(jsonobj: object) {
                let str = JSON.stringify(jsonobj, null, 2);
                return "<pre>" + str + "</pre>";
            }
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );
            return pretty(goodlist);
        }
        */
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
            console.log(html);
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
                    console.log(content);
                    console.log(last);
                    if (!!content.equal(last)) return [3 /*break*/, 10];
                    return [4 /*yield*/, sub.saveRecord(content)];
                case 3:
                    _a.sent();
                    if (!last.isNull) return [3 /*break*/, 5];
                    return [4 /*yield*/, Email.send(sub.emails, sub.name + ": First run ", headers(sub.notificationContent(content, last), content, last))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 5:
                    if (!sub.interestDetector(content, last)) return [3 /*break*/, 7];
                    return [4 /*yield*/, Email.send(sub.emails, sub.name + ": interesting change detected", headers(sub.notificationContent(content, last), content, last))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, Email.send(sub.emails, sub.name + ": change detected but not interesting", headers(sub.notificationContent(content, last), content, last))];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    console.log("change not detected - no action");
                    if (!sub.notifyEvenNothingNew) return [3 /*break*/, 12];
                    return [4 /*yield*/, Email.send(sub.emails, sub.name + ": nothing new (but you asked me to send this)", headers(sub.notificationContent(content, last), content, last))];
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
                    if (!(i < subs.length)) return [3 /*break*/, 7];
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
                            name: sub.name,
                            error: errors
                        });
                    }
                    console.log(err_1);
                    console.log("Error but soldier on....");
                    return [3 /*break*/, 5];
                case 5:
                    if (errors) {
                        Email.send(["xhuang@gmail.coom"], errors.length + " from latest run", JSON.stringify(errors, null, 2));
                    }
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
doit().then(function () { return process.exit(); });
//# sourceMappingURL=watcher.js.map