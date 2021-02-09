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
exports.jqexec = void 0;
var cheerio = require('cheerio');
var CloudDB = require("./CloudDB");
function doit2() {
    return __awaiter(this, void 0, void 0, function () {
        var targetTable, record, dom, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetTable = "County-Vaccine-Data";
                    return [4 /*yield*/, CloudDB.getLastRecord("California-Vaccine")];
                case 1:
                    record = _a.sent();
                    dom = cheerio.load(record);
                    data = dom("#counties-vaccination-data").html();
                    console.log(data);
                    return [4 /*yield*/, CloudDB.saveInfoAtSystem(targetTable, data)];
                case 2:
                    _a.sent();
                    console.log("hello!");
                    return [2 /*return*/];
            }
        });
    });
}
var CheerioCommand = /** @class */ (function () {
    function CheerioCommand(cssSelector) {
        this.cssSelector = cssSelector;
    }
    CheerioCommand.prototype.execute = function (input) {
        var dom = cheerio.load(input);
        var data = dom(this.cssSelector).html();
        return data;
    };
    return CheerioCommand;
}());
var DataMovingJob = /** @class */ (function () {
    function DataMovingJob(source, dest, commands) {
        this.sourceTable = source;
        this.destTable = dest;
        this.processing = commands;
    }
    DataMovingJob.prototype.execute = function (input) {
        var start = input;
        var end = undefined;
        for (var i = 0; i < this.processing.length; i++) {
            var cmd = this.processing[i];
            end = cmd.execute(start);
            start = end;
        }
        return end;
    };
    return DataMovingJob;
}());
;
var Jobs = [
    new DataMovingJob("California-Vaccine", "County-Vaccine-Data", [new CheerioCommand("#counties-vaccination-data")])
];
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        var job1, targetTable, records, _i, records_1, record, data, dom, processed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    job1 = Jobs[0];
                    targetTable = "County-Vaccine-Data";
                    return [4 /*yield*/, CloudDB.getFullRecords("California-Vaccine")];
                case 1:
                    records = _a.sent();
                    _i = 0, records_1 = records;
                    _a.label = 2;
                case 2:
                    if (!(_i < records_1.length)) return [3 /*break*/, 5];
                    record = records_1[_i];
                    console.log(record.timestamp);
                    data = record.data;
                    dom = cheerio.load(data);
                    processed = dom("#counties-vaccination-data").html();
                    return [4 /*yield*/, CloudDB.saveInfoAtSystem(targetTable, processed, record.timestamp)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: 
                /*
                let record = await CloudDB.getLastRecord("California-Vaccine");
                let dom = cheerio.load(record);
                let data = dom("#counties-vaccination-data").html();
                console.log(data);
            
                await CloudDB.saveInfoAtSystem(targetTable, data);
            
                console.log("hello!");
                */
                return [2 /*return*/];
            }
        });
    });
}
/*
* The Job (from table to table)
*     From Table1 --> process ---> Table 2
*
*  1 time processing
*  recurrent processing
*  catch up processing (in case of error)
*
* table to remember whehther an entry has been successfully executed or not.
* trigger to process...

* Issues:
  - need to remember which one has been run
  - Ordering may matter for the data...
  - framework should carry the timestamp...
*
*/
console.log("hello! 1");
// doit();
var jq = require('node-jq');
function doit3() {
    return __awaiter(this, void 0, void 0, function () {
        var targetTable, record, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetTable = "NYS-Covid";
                    return [4 /*yield*/, CloudDB.getLastRecord(targetTable)];
                case 1:
                    record = _a.sent();
                    data = JSON.stringify(record, null, 2);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            jq.run('.lastUpdated', 
                            // '{ "foo": "bar" }',
                            data, { input: 'string' }).then(function (x) { console.log(x); resolve(true); });
                        })];
            }
        });
    });
}
function jqexec(emails, subject, html) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'yumyumlifemailer@gmail.com',
                            pass: process.env.MAILER_PASSWORD
                        }
                    });
                    var mailOptions = {
                        from: 'Yum Yum <yumyumlifemailer@gmail.com>',
                        to: emails.join(","),
                        subject: subject,
                        html: html
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log("error is " + error);
                            resolve(false); // or use rejcet(false) but then you will have to handle errors
                        }
                        else {
                            console.log('Email sent: ' + info.response);
                            resolve(true);
                        }
                    });
                })];
        });
    });
}
exports.jqexec = jqexec;
doit3();
//# sourceMappingURL=debug.js.map