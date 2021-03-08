"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list_deep_dedup = exports.saveJobsStatus = exports.fetchJobsStatus = exports.JobStatusTable = exports.JobExecStatus = void 0;
var fireorm_1 = require("fireorm");
var JobExecStatus;
(function (JobExecStatus) {
    JobExecStatus["UNKNOWN"] = "pending";
    JobExecStatus["SUCCESS"] = "success";
    JobExecStatus["FAIL"] = "failed";
})(JobExecStatus = exports.JobExecStatus || (exports.JobExecStatus = {}));
var JobStatusTable = /** @class */ (function () {
    function JobStatusTable() {
    }
    JobStatusTable_1 = JobStatusTable;
    JobStatusTable.fromTableName = function (tablename) {
        var newitem = new JobStatusTable_1();
        newitem.id = tablename;
        newitem.tableName = tablename;
        newitem.data = {};
        return newitem;
    };
    JobStatusTable.prototype.computeUnfinishedJobs = function (allJobs) {
        var unfinished = [];
        for (var _i = 0, allJobs_1 = allJobs; _i < allJobs_1.length; _i++) {
            var job = allJobs_1[_i];
            var status_1 = this.data[job.key];
            if (!status_1 || status_1 != JobExecStatus.SUCCESS) {
                unfinished.push(job);
            }
        }
        return unfinished;
    };
    var JobStatusTable_1;
    JobStatusTable = JobStatusTable_1 = __decorate([
        fireorm_1.Collection()
    ], JobStatusTable);
    return JobStatusTable;
}());
exports.JobStatusTable = JobStatusTable;
function fetchJobsStatus(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var repos, table;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repos = fireorm_1.getRepository(JobStatusTable);
                    return [4 /*yield*/, repos.whereEqualTo(function (a) { return a.tableName; }, tablename).findOne()];
                case 1:
                    table = _a.sent();
                    if (!!table) return [3 /*break*/, 3];
                    table = JobStatusTable.fromTableName(tablename);
                    return [4 /*yield*/, repos.create(table)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, table];
            }
        });
    });
}
exports.fetchJobsStatus = fetchJobsStatus;
function saveJobsStatus(job) {
    return __awaiter(this, void 0, void 0, function () {
        var repos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repos = fireorm_1.getRepository(JobStatusTable);
                    return [4 /*yield*/, repos.update(job)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveJobsStatus = saveJobsStatus;
function list_deep_dedup(list) {
    return list.reduce(function (r, i) {
        return !r.some(function (j) { return !Object.keys(i).some(function (k) { return i[k] !== j[k]; }); }) ? __spreadArrays(r, [i]) : r;
    }, []);
}
exports.list_deep_dedup = list_deep_dedup;
//# sourceMappingURL=MapReduceUtils.js.map