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
exports.fetchUnfinishedJobs = exports.saveJobStatusTable = exports.getJobStatusTable = exports.getFullRecords = exports.getFirstRecord = exports.getLastRecord = exports.saveInfoAtSystem = exports.DataRecord = exports.getStorageRef = exports.getDB = void 0;
var moment = require("moment");
global.XMLHttpRequest = require("xhr2"); // req'd for getting around firebase bug in nodejs.
require("@firebase/firestore");
require("@firebase/storage");
var firebase = require("firebase");
var cryptojs = require("crypto-js");
var superagent = require('superagent');
var firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
function getDB() {
    return db;
}
exports.getDB = getDB;
function getStorageRef() {
    return firebase.storage().ref();
}
exports.getStorageRef = getStorageRef;
var DataRecord = /** @class */ (function () {
    function DataRecord(key, contentMd5, unixtimestamp, dataurl) {
        this.key = key;
        this.timestamp = unixtimestamp;
        this.timestampReadable = moment.unix(this.timestamp).toString();
        this.dataUrl = dataurl;
        this.dataMd5 = contentMd5;
    }
    DataRecord.factory = function (obj) {
        return new DataRecord(obj.key, obj.dataMd5, obj.timestamp, obj.dataUrl);
    };
    DataRecord.prototype.fetchData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.dataUrl)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataRecord.prototype.toSimpleObject = function () {
        return Object.assign({}, this);
    };
    return DataRecord;
}());
exports.DataRecord = DataRecord;
;
function snapshotToArrayData(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(childSnapshot.data());
    });
    return result;
}
function snapshotToArrayDataRecord(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(DataRecord.factory(childSnapshot.data()));
    });
    return result;
}
var StorageRootDirectory = "WatchStorage";
function storeStringAsBlob(tablename, dockey, content) {
    return __awaiter(this, void 0, void 0, function () {
        var ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ref = getStorageRef().child(StorageRootDirectory + "/" + tablename + "/" + dockey + ".txt");
                    // Raw string is the default if no format is provided
                    return [4 /*yield*/, ref.putString(content)];
                case 1:
                    // Raw string is the default if no format is provided
                    _a.sent();
                    return [4 /*yield*/, ref.getDownloadURL()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// some application semantics 
function saveInfoAtSystem(tablename, content, timestamp) {
    if (timestamp === void 0) { timestamp = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var docRef, url, obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection(tablename).doc();
                    return [4 /*yield*/, storeStringAsBlob(tablename, docRef.id, content)];
                case 1:
                    url = _a.sent();
                    timestamp = timestamp ? timestamp : moment().unix();
                    obj = new DataRecord(docRef.id, cryptojs.MD5(content).toString(), timestamp, url);
                    return [4 /*yield*/, docRef.set(obj.toSimpleObject())];
                case 2:
                    _a.sent();
                    return [2 /*return*/, obj];
            }
        });
    });
}
exports.saveInfoAtSystem = saveInfoAtSystem;
function fetch(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, superagent.get(url)
                        .buffer(true) // this is due to google url returns application/oct stream.
                        .then(function (res) {
                        return res.body.toString();
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getLastRecord(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, dataUrl, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    docRef = db.collection(tablename).orderBy("timestamp", "desc").limit(1);
                    dataUrl = null;
                    return [4 /*yield*/, docRef.get().then(function (querySnapshot) {
                            querySnapshot.forEach(function (doc) {
                                dataUrl = doc.data().dataUrl;
                            });
                        })];
                case 1:
                    _b.sent();
                    if (!(dataUrl)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch(dataUrl)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = null;
                    _b.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    });
}
exports.getLastRecord = getLastRecord;
function getFirstRecord(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, dataUrl, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    docRef = db.collection(tablename).orderBy("timestamp", "asc").limit(1);
                    dataUrl = null;
                    return [4 /*yield*/, docRef.get().then(function (querySnapshot) {
                            querySnapshot.forEach(function (doc) {
                                dataUrl = doc.data().dataUrl;
                            });
                        })];
                case 1:
                    _b.sent();
                    if (!(dataUrl)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch(dataUrl)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = null;
                    _b.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    });
}
exports.getFirstRecord = getFirstRecord;
function getFullRecords(tablename) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection(tablename).orderBy("timestamp", "asc");
                    return [4 /*yield*/, docRef.get().then(function (querySnapshot) {
                            return snapshotToArrayDataRecord(querySnapshot);
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getFullRecords = getFullRecords;
function getJobStatusTable(jobDescriptionID) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection("JobStatus").doc(jobDescriptionID);
                    return [4 /*yield*/, docRef.get().then(function (doc) {
                            return doc.data() || {};
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getJobStatusTable = getJobStatusTable;
function saveJobStatusTable(tablename, jobstatus) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection("JobStatus").doc(tablename);
                    return [4 /*yield*/, docRef.update(jobstatus).then(function (doc) {
                        }).catch(function (err) {
                            return null;
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.saveJobStatusTable = saveJobStatusTable;
function fetchUnfinishedJobs(tablename, skips, njobs) {
    if (njobs === void 0) { njobs = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = db.collection(tablename)
                        .orderBy("timestamp", "asc")
                        .where("key", "not-in", skips)
                        .limit(njobs);
                    return [4 /*yield*/, docRef.get().then(function (querySnapshot) {
                            return snapshotToArrayDataRecord(querySnapshot);
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.fetchUnfinishedJobs = fetchUnfinishedJobs;
//# sourceMappingURL=CloudDB.js.map