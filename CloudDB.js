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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.getFullRecords = exports.getFirstRecord = exports.getLastRecord = exports.saveInfoAtSystem = exports.InjestedData = exports.DataRecord = exports.getStorageRef = exports.getDB = void 0;
var moment = __importStar(require("moment"));
var fireorm = __importStar(require("fireorm"));
var fireorm_1 = require("fireorm");
global.XMLHttpRequest = require("xhr2"); // req'd for getting around firebase bug in nodejs.
require("@firebase/firestore");
require("@firebase/storage");
var firebase = require("firebase");
var superagent = require('superagent');
var firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
fireorm.initialize(db, {
    validateModels: true
});
function getDB() {
    return db;
}
exports.getDB = getDB;
function getStorageRef() {
    return firebase.storage().ref();
}
exports.getStorageRef = getStorageRef;
var DataRecord = /** @class */ (function () {
    function DataRecord() {
    }
    /*
    constructor(key: string, unixtimestamp: number, dataBucket: string, dataPath: string, dataurl: string) {
        this.key = key;
        this.timestamp = unixtimestamp;
        this.timestampReadable = moment.unix(this.timestamp).toString();
        this.dataUrl = dataurl;
        this.dataBucket = dataBucket;
        this.dataPath = dataPath;
    }
    */
    /*
    static factory(obj: any) {
        return new DataRecord(
            obj.key,
            obj.timestamp,
            obj.dataBucket,
            obj.dataPath,
            obj.dataUrl,
        )
    }
    */
    DataRecord.factory = function (obj) {
        var data = new DataRecord();
        data.key = obj.key;
        data.timestamp = obj.timestamp;
        data.dataBucket = obj.dataBucket;
        data.dataPath = obj.dataPath;
        data.dataUrl = obj.dataUrl;
        return data;
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
var InjestedData = /** @class */ (function () {
    function InjestedData() {
        this.displayName = null;
    }
    InjestedData_1 = InjestedData;
    InjestedData.prototype.dataRecordAdd = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var record, url, timestamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataRecords.create(new DataRecord())];
                    case 1:
                        record = _a.sent();
                        return [4 /*yield*/, storeStringAsBlob(this.id, record.id, content)];
                    case 2:
                        url = _a.sent();
                        timestamp = moment.now() / 1000;
                        record.timestamp = timestamp;
                        record.dataBucket = firebaseConfig.storageBucket;
                        record.dataPath = storageFileName(this.id, record.id);
                        record.dataUrl = url;
                        return [4 /*yield*/, this.dataRecords.update(record)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InjestedData.prototype.lastDataRecord = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataRecords.orderByDescending(function (item) { return item.timestamp; }).findOne()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InjestedData.findOrCreate = function (storageTableName) {
        return __awaiter(this, void 0, void 0, function () {
            var storageTable, newtable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fireorm_1.getRepository(InjestedData_1).findById(storageTableName)];
                    case 1:
                        storageTable = _a.sent();
                        if (!!storageTable) return [3 /*break*/, 3];
                        newtable = new InjestedData_1();
                        newtable.id = storageTableName;
                        return [4 /*yield*/, fireorm_1.getRepository(InjestedData_1).create(newtable)];
                    case 2:
                        storageTable = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, storageTable];
                }
            });
        });
    };
    var InjestedData_1;
    __decorate([
        fireorm_1.SubCollection(DataRecord)
    ], InjestedData.prototype, "dataRecords", void 0);
    InjestedData = InjestedData_1 = __decorate([
        fireorm_1.Collection()
    ], InjestedData);
    return InjestedData;
}());
exports.InjestedData = InjestedData;
function snapshotToArrayDataRecord(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(DataRecord.factory(childSnapshot.data()));
    });
    return result;
}
var StorageRootDirectory = "WatchStorage";
function storageFileName(tablename, dockey) {
    return StorageRootDirectory + "/" + tablename + "/" + dockey + ".txt";
}
function storeStringAsBlob(tablename, dockey, content) {
    return __awaiter(this, void 0, void 0, function () {
        var ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ref = getStorageRef().child(storageFileName(tablename, dockey));
                    return [4 /*yield*/, ref.putString(content)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ref.getDownloadURL()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// some application semantics 
function saveInfoAtSystem(tablename, content, timestamp, key) {
    if (timestamp === void 0) { timestamp = 0; }
    if (key === void 0) { key = null; }
    return __awaiter(this, void 0, void 0, function () {
        var docRef, url, obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = (key) ?
                        db.collection(tablename).doc(key) :
                        db.collection(tablename).doc();
                    return [4 /*yield*/, storeStringAsBlob(tablename, docRef.id, content)];
                case 1:
                    url = _a.sent();
                    timestamp = timestamp ? timestamp : moment.now() / 1000; // convert from ms to seconds.
                    obj = DataRecord.factory({
                        key: docRef.id,
                        timestamp: timestamp,
                        dataBucket: firebaseConfig.storageBucket,
                        dataPath: storageFileName(tablename, docRef.id),
                        dataUrl: url,
                    });
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
//# sourceMappingURL=CloudDB.js.map