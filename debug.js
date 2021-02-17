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
function computeUnfinishedJobs(allJobs, successIds) {
    var successIdsMap = successIds.reduce(function (map, obj) {
        map[obj] = true;
        return map;
    }, {});
    var unfinished = [];
    for (var _i = 0, allJobs_1 = allJobs; _i < allJobs_1.length; _i++) {
        var job = allJobs_1[_i];
        if (!successIdsMap[job.key]) {
            unfinished.push(job);
        }
    }
    return unfinished;
}
function getSuccessfulJobs(jobStatusTable) {
    var successIds = [];
    for (var key in jobStatusTable) {
        if (jobStatusTable[key] === JobExecStatus.SUCCESS) {
            successIds.push(key);
        }
    }
    return successIds;
}
function fetchJobsStatus(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, CloudDB.getJobStatusTable(tablename)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function reducer(srctablename, jobTableName, outputTable, fun) {
    return __awaiter(this, void 0, void 0, function () {
        var jobStatusTable, successIds, allJobs, records, initialresult, previousresults, succesfulruns, _i, records_1, record, data, error_1, _a, succesfulruns_1, job;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetchJobsStatus(jobTableName)];
                case 1:
                    jobStatusTable = _b.sent();
                    successIds = getSuccessfulJobs(jobStatusTable);
                    return [4 /*yield*/, CloudDB.getFullRecords(srctablename)];
                case 2:
                    allJobs = _b.sent();
                    records = computeUnfinishedJobs(allJobs, successIds);
                    return [4 /*yield*/, CloudDB.getLastRecord(outputTable)];
                case 3:
                    initialresult = _b.sent();
                    previousresults = initialresult;
                    succesfulruns = [];
                    _i = 0, records_1 = records;
                    _b.label = 4;
                case 4:
                    if (!(_i < records_1.length)) return [3 /*break*/, 10];
                    record = records_1[_i];
                    console.log("working on:", record.key);
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, record.fetchData()];
                case 6:
                    data = _b.sent();
                    return [4 /*yield*/, fun(data, previousresults)];
                case 7:
                    previousresults = _b.sent();
                    succesfulruns.push(record.key);
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    console.log("error on:", record.key);
                    console.log(error_1);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 4];
                case 10:
                    if (!(previousresults !== initialresult)) return [3 /*break*/, 12];
                    // persist the new results. 
                    return [4 /*yield*/, CloudDB.saveInfoAtSystem(outputTable, previousresults)];
                case 11:
                    // persist the new results. 
                    _b.sent();
                    _b.label = 12;
                case 12:
                    if (!(succesfulruns.length > 0)) return [3 /*break*/, 14];
                    for (_a = 0, succesfulruns_1 = succesfulruns; _a < succesfulruns_1.length; _a++) {
                        job = succesfulruns_1[_a];
                        jobStatusTable[job] = JobExecStatus.SUCCESS;
                    }
                    return [4 /*yield*/, CloudDB.saveJobStatusTable(jobTableName, jobStatusTable)];
                case 13:
                    _b.sent();
                    _b.label = 14;
                case 14:
                    console.log("done with reducer");
                    return [2 /*return*/];
            }
        });
    });
}
function list_deep_dedup(list) {
    return list.reduce(function (r, i) {
        return !r.some(function (j) { return !Object.keys(i).some(function (k) { return i[k] !== j[k]; }); }) ? __spreadArrays(r, [i]) : r;
    }, []);
}
function testmapper() {
    return __awaiter(this, void 0, void 0, function () {
        function process(input, dataRecord) {
            return __awaiter(this, void 0, void 0, function () {
                var dom, processed;
                return __generator(this, function (_a) {
                    dom = cheerio.load(input);
                    processed = dom("#counties-vaccination-data").html();
                    return [2 /*return*/, processed];
                });
            });
        }
        var srctablename, jobTableName, outputTable, jobStatusTable, successIds, allJobs, records, dirty, _i, records_2, record, data, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    srctablename = "California-Vaccine 2";
                    jobTableName = "California-Vaccine-2-job";
                    outputTable = "testoutput";
                    return [4 /*yield*/, fetchJobsStatus(jobTableName)];
                case 1:
                    jobStatusTable = _a.sent();
                    successIds = getSuccessfulJobs(jobStatusTable);
                    return [4 /*yield*/, CloudDB.getFullRecords(srctablename)];
                case 2:
                    allJobs = _a.sent();
                    records = computeUnfinishedJobs(allJobs, successIds);
                    dirty = false;
                    _i = 0, records_2 = records;
                    _a.label = 3;
                case 3:
                    if (!(_i < records_2.length)) return [3 /*break*/, 8];
                    record = records_2[_i];
                    console.log("working on:", record.key);
                    jobStatusTable[record.key] = JobExecStatus.SUCCESS;
                    return [4 /*yield*/, record.fetchData()];
                case 4:
                    data = _a.sent();
                    return [4 /*yield*/, process(data, record)];
                case 5:
                    output = _a.sent();
                    if (!output) return [3 /*break*/, 7];
                    return [4 /*yield*/, CloudDB.saveInfoAtSystem(outputTable, output, record.timestamp, record.key)];
                case 6:
                    _a.sent();
                    dirty = true;
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    if (!dirty) return [3 /*break*/, 10];
                    return [4 /*yield*/, CloudDB.saveJobStatusTable(jobTableName, jobStatusTable)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    console.log("nothing to update");
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
function testreducer() {
    return __awaiter(this, void 0, void 0, function () {
        var srctablename, jobTableName, outputTable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    srctablename = "testoutput";
                    jobTableName = "California-Reducer";
                    outputTable = "Calfiornia-Vaccine-finaloutput";
                    return [4 /*yield*/, reducer(srctablename, jobTableName, outputTable, function (content, preresult) {
                            var pre = preresult ?
                                JSON.parse(preresult) : [];
                            var input = JSON.parse(content);
                            for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
                                var entry = input_1[_i];
                                pre.push({
                                    fips: entry.fips,
                                    county: entry.county,
                                    date: entry.date,
                                    doses_administered: entry.doses_administered,
                                    population: entry.population,
                                    new_doses_administered: entry.new_doses_administered,
                                    doses_administered_per_100k: entry.doses_administered_per_100k,
                                });
                            }
                            pre = list_deep_dedup(pre);
                            console.log("so far length is :" + pre.length);
                            return JSON.stringify(pre);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // await testmapper();
                return [4 /*yield*/, testreducer()];
                case 1:
                    // await testmapper();
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
doit();
//# sourceMappingURL=debug.js.map