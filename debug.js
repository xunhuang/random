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
var JobExecStatus = {
    UNKNOWN: "pending",
    SUCCESS: "success",
    FAIL: "failed",
};
function fetchSuccessfulJobs(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var jobStatusTable, successIds, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, CloudDB.getJobStatusTable(tablename)];
                case 1:
                    jobStatusTable = _a.sent();
                    successIds = [];
                    for (key in jobStatusTable) {
                        if (jobStatusTable[key] === JobExecStatus.SUCCESS) {
                            successIds.push(key);
                        }
                    }
                    return [2 /*return*/, successIds];
            }
        });
    });
}
function fetchUnfinishedJobs(tablename, njobs) {
    if (njobs === void 0) { njobs = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var successIds, allJobs, successIdsMap, unfinished, _i, allJobs_1, job;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchSuccessfulJobs(tablename)];
                case 1:
                    successIds = _a.sent();
                    return [4 /*yield*/, CloudDB.getFullRecords(tablename)];
                case 2:
                    allJobs = _a.sent();
                    successIdsMap = successIds.reduce(function (map, obj) {
                        map[obj] = true;
                        return map;
                    }, {});
                    unfinished = [];
                    for (_i = 0, allJobs_1 = allJobs; _i < allJobs_1.length; _i++) {
                        job = allJobs_1[_i];
                        if (!successIdsMap[job.key]) {
                            unfinished.push(job);
                        }
                    }
                    return [2 /*return*/, unfinished];
            }
        });
    });
}
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        var targetTable, outputTable, records, jobStatusTable, _i, records_1, record, data, dom, processed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetTable = "California-Vaccine 2";
                    outputTable = "testoutput";
                    return [4 /*yield*/, fetchUnfinishedJobs(targetTable)];
                case 1:
                    records = _a.sent();
                    jobStatusTable = {};
                    _i = 0, records_1 = records;
                    _a.label = 2;
                case 2:
                    if (!(_i < records_1.length)) return [3 /*break*/, 6];
                    record = records_1[_i];
                    console.log("skipping work:", record.key);
                    jobStatusTable[record.key] = JobExecStatus.SUCCESS;
                    return [4 /*yield*/, record.fetchData()];
                case 3:
                    data = _a.sent();
                    dom = cheerio.load(data);
                    processed = dom("#counties-vaccination-data").html();
                    return [4 /*yield*/, CloudDB.saveInfoAtSystem(outputTable, processed, record.timestamp)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    if (Object.entries(jobStatusTable).length > 0) {
                        // await CloudDB.saveJobStatusTable(targetTable, jobStatusTable);
                    }
                    else {
                        console.log("nothing to update");
                    }
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
doit();
//# sourceMappingURL=debug.js.map