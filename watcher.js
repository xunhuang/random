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
var nodemailer = require('nodemailer');
//const ContentDiffer = require('./ContentDiffer');
var ContentDiffer = require("./ContentDiffer");
var moment = require("moment");
var firebase = require("firebase");
require("firebase/firestore");
var firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
// 
// descriptors for subscriptions
// 
// future attributes
// data retention
// pull frequency
// differening -
// save the "last" item's id for comparison
var Subscriptions = [
    {
        name: "NYS Covid Watcher",
        watchURL: "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers",
        contentType: "json",
        storageTableName: "NYS-COVID-2",
        emails: ["xhuang@gmail.com"],
        interestDetector: function (current, last) {
            var goodlist = current.providerList.filter(function (site) {
                return (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY");
            });
            return goodlist.length > 0;
        },
        notificationContent: function (current, last) {
            var goodlist = current.providerList.filter(function (site) {
                return (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY");
            });
            return pretty(goodlist);
        }
    },
    {
        name: "Stanford Hospital",
        watchURL: "https://stanfordhealthcare.org/discover/covid-19-resource-center/patient-care/safety-health-vaccine-planning.html",
        contentType: "text",
        storageTableName: "Stanford-Vaccine",
        emails: ["xhuang@gmail.com"],
        interestDetector: function (current, last) {
            return true;
        },
        notificationContent: function (current, last) {
            return current;
        }
    },
    {
        name: "Hacker News",
        watchURL: "https://news.ycombinator.com",
        contentType: "text",
        storageTableName: "HackerNews",
        emails: ["xhuang@gmail.com"],
        interestDetector: function (current, last) {
            return true;
        },
        notificationContent: function (current, last) {
            return current;
        }
    },
    {
        name: "Alameda County Vaccine Hospital",
        watchURL: "https://covid-19.acgov.org/vaccines",
        customHeaders: {
            'user-agent': 'curl/7.64.1',
        },
        contentType: "text",
        storageTableName: "Alameda-Vaccine",
        emails: ["xhuang@gmail.com"],
        // notifyEvenNothingNew: true,
        interestDetector: function (current, last) {
            return true;
        },
        notificationContent: function (current, last) {
            return current;
        }
    }
];
// system function 
function saveInfoAtSystem(tablename, content) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection(tablename).doc();
                    obj = {
                        key: docRef.id,
                        timestamp: moment().unix(),
                        data: content,
                    };
                    return [4 /*yield*/, docRef.set(obj).then(function (doc) {
                        }).catch(function (err) {
                            return null;
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, obj];
            }
        });
    });
}
function getLastRecord(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, last;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection(tablename).orderBy("timestamp", "desc").limit(1);
                    last = null;
                    return [4 /*yield*/, docRef.get().then(function (querySnapshot) {
                            querySnapshot.forEach(function (doc) {
                                last = doc.data().data;
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, last];
            }
        });
    });
}
function getFirstRecord(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, first;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection(tablename).orderBy("timestamp", "asc").limit(1);
                    first = null;
                    return [4 /*yield*/, docRef.get().then(function (querySnapshot) {
                            querySnapshot.forEach(function (doc) {
                                first = doc.data().data;
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, first];
            }
        });
    });
}
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
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'yumyumlifemailer@gmail.com',
        pass: process.env.MAILER_PASSWORD
    }
});
var sendEmail = function (emails, subject, html) {
    var mailOptions = {
        from: 'Yum Yum <yumyumlifemailer@gmail.com>',
        to: emails.join(","),
        subject: subject,
        html: html
    };
    console.log("Mailng " + emails.join(",") + "with  subject:" + subject);
    transporter.sendMail(mailOptions, function (erro, info) {
        if (erro) {
            console.log("Mail Error" + erro.toString());
            return;
        }
        console.log("Mail sent to " + emails + " subject:" + subject);
    });
};
function pretty(jsonobj) {
    var str = JSON.stringify(jsonobj, null, 2);
    return "<pre>" + str + "</pre>";
}
function processSubscription(sub) {
    return __awaiter(this, void 0, void 0, function () {
        // let last = await getFirstRecord(tablename);
        function headers(input, content, last) {
            var diff;
            if (content && last) {
                if (typeof content == "string") {
                    diff = ContentDiffer.diffHtmlPages(last, content);
                }
                if (typeof content == "object") {
                    diff = ContentDiffer.diffJsonObjects(last, content);
                }
            }
            var html = "\n        <html>\n           <body>\n              <h4> Watch URL: " + sub.watchURL + "</h4>\n              " + (diff && "<h4> Changes:  </h4>\n                       <pre> " + diff + " </pre> ") + "\n            <h4>Website Current Content < /h4>\n            " + input + "\n            </body>\n        < /html>\n            ";
            return html;
        }
        var content, tablename, last;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scrape(sub.watchURL, sub.customHeaders)];
                case 1:
                    content = _a.sent();
                    if (sub.contentType == "json") {
                        content = JSON.parse(content);
                    }
                    tablename = sub.storageTableName;
                    return [4 /*yield*/, getLastRecord(tablename)];
                case 2:
                    last = _a.sent();
                    if (!!ContentDiffer.isContentTheSame(content, last)) return [3 /*break*/, 4];
                    return [4 /*yield*/, saveInfoAtSystem(tablename, content)];
                case 3:
                    _a.sent();
                    if (sub.interestDetector(content, last)) {
                        sendEmail(sub.emails, sub.name + ": interesting change detected", headers(sub.notificationContent(content, last), content, last));
                    }
                    else {
                        sendEmail(sub.emails, sub.name + ": change detected but not interesting", headers(sub.notificationContent(content, last), content, last));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    console.log("change not detected - no action");
                    if (sub.notifyEvenNothingNew) {
                        sendEmail(sub.emails, sub.name + ": nothing new (but you asked me to send this)", headers(sub.notificationContent(content, last), content, last));
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        var i, sub, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < Subscriptions.length)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    sub = Subscriptions[i];
                    console.log(sub);
                    return [4 /*yield*/, processSubscription(sub)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.log(err_1);
                    console.log("Error but soldier on....");
                    return [3 /*break*/, 5];
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
doit();
//# sourceMappingURL=watcher.js.map