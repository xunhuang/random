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
var Email = __importStar(require("./Email"));
var RandomDataTable_1 = require("./RandomDataTable");
var MRUtils = __importStar(require("./MapReduceUtils"));
var BigQuery = require('@google-cloud/bigquery').BigQuery;
var Storage = require('@google-cloud/storage').Storage;
var GCSToBigQueryJobs = /** @class */ (function () {
    function GCSToBigQueryJobs(name, srctablename, outputTable, options) {
        if (options === void 0) { options = null; }
        this.jobTableName = null;
        this.options = null;
        this.datasetId = 'my_dataset';
        this.name = name;
        this.srctablename = srctablename;
        this.outputTable = outputTable;
        if (options) {
            for (var key in options) {
                this[key] = options[key];
            }
        }
        if (!this.jobTableName) {
            this.jobTableName = "GCSToBigQuery-" + this.srctablename + "-" + this.outputTable;
        }
    }
    GCSToBigQueryJobs.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobStatusTable, allJobs, records, _i, records_1, record, bigquery, storage, metadata, storagepath, job, errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MRUtils.fetchJobsStatus(this.jobTableName)];
                    case 1:
                        jobStatusTable = _a.sent();
                        return [4 /*yield*/, RandomDataTable_1.RandomDataTable.findTableRecords(this.srctablename)];
                    case 2:
                        allJobs = _a.sent();
                        records = jobStatusTable.computeUnfinishedJobs(allJobs);
                        console.log(records.length + " records to process");
                        _i = 0, records_1 = records;
                        _a.label = 3;
                    case 3:
                        if (!(_i < records_1.length)) return [3 /*break*/, 7];
                        record = records_1[_i];
                        console.log("working on:", record.id);
                        console.log(record);
                        bigquery = new BigQuery();
                        storage = new Storage();
                        metadata = {
                            sourceFormat: 'NEWLINE_DELIMITED_JSON',
                            schemaUpdateOptions: ['ALLOW_FIELD_ADDITION'],
                            autodetect: true,
                            location: 'US',
                        };
                        if (!record.isValid()) {
                            console.log("Skipping invalid record...");
                            console.log(record);
                            return [3 /*break*/, 6];
                        }
                        storagepath = storage.bucket(record.dataBucket).file(record.dataPath);
                        return [4 /*yield*/, bigquery
                                .dataset(this.datasetId)
                                .table(this.outputTable)
                                .load(storagepath, metadata)];
                    case 4:
                        job = (_a.sent())[0];
                        console.log("Job " + job.id + " completed.");
                        errors = job.status.errors;
                        if (errors && errors.length > 0) {
                            throw errors;
                        }
                        jobStatusTable.data[record.id] = MRUtils.JobExecStatus.SUCCESS;
                        return [4 /*yield*/, MRUtils.saveJobsStatus(jobStatusTable)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return GCSToBigQueryJobs;
}());
function executeMappers(jobs) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, _i, jobs_1, job, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errors = [];
                    _i = 0, jobs_1 = jobs;
                    _a.label = 1;
                case 1:
                    if (!(_i < jobs_1.length)) return [3 /*break*/, 6];
                    job = jobs_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log(job);
                    return [4 /*yield*/, job.execute()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.log(err_1);
                    console.log("Error but soldier on....");
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    if (!(errors.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, Email.send(["xhuang@gmail.com"], "Mapper Execution: " + errors.length + " from latest run", JSON.stringify(errors, null, 2))];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
var BigQueryJobs = [
    new GCSToBigQueryJobs("CDC Test County Data(XFER)", "CDC-County-Test-JSONL3", "CDC-County-Test-Time-Series-new"
    /*
bq --location=US query --replace \
--destination_table myrandomwatch-b4b41:my_dataset.CDC-County-Test-Time-Series-new \
--use_legacy_sql=false '        SELECT DATE(report_date) as report_date, DATE(case_death_end_date) as case_death_end_date, DATE(testing_start_date) as testing_start_date, DATE(testing_end_date) as testing_end_date, DATE(case_death_start_date) as case_death_start_date, * except ( case_death_end_date, testing_start_date, testing_end_date, report_date, case_death_start_date )  FROM `myrandomwatch-b4b41.my_dataset.CDC-County-Test-Time-Series-new`'
*/
    ),
    new GCSToBigQueryJobs("CA County Data (XFER to BQ)", "Calfiornia-Vaccine-Overtime-Table-NLJSON", "Calfiornia-Vaccine-Overtime"),
    new GCSToBigQueryJobs("CDC Vaccine County Data (XFER TO BQ)", "CDC-Vaccine-Overtime-Table-NLJSON", "CDC-Vaccine-Overtime-Table"),
];
function doit() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, executeMappers(BigQueryJobs)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
doit().then(function () { return process.exit(); });
//# sourceMappingURL=GCSToBigQuery.js.map