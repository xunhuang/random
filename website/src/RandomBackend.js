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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomBackend = void 0;
var AuthUser_1 = require("./AuthUser");
var fireorm_1 = require("fireorm");
var fireorm = __importStar(require("fireorm"));
require("@firebase/firestore");
require("@firebase/auth");
var firebase = require('firebase/app').default;
var firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
fireorm.initialize(firebase.firestore(), {
    validateModels: true
});
var RandomBackendClass = /** @class */ (function () {
    function RandomBackendClass() {
        this.currentUser = null;
    }
    ;
    RandomBackendClass.prototype.login = function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log(result.user);
        }).catch(function (error) {
            console.log(error);
        });
    };
    RandomBackendClass.prototype.logout = function () {
        this.currentUser = null;
        firebase.auth().signOut();
    };
    RandomBackendClass.prototype.userStatusChange = function (f) {
        var _this = this;
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                fireorm_1.getRepository(AuthUser_1.AuthUser).findById(user.uid).then(function (firebaseUser) {
                    _this.currentUser = firebaseUser;
                    if (!firebaseUser) {
                        _this.currentUser = AuthUser_1.AuthUser.fromFirebaseUser(user);
                        fireorm_1.getRepository(AuthUser_1.AuthUser).create(_this.currentUser);
                    }
                    f(_this.currentUser);
                });
            }
            else {
                console.log("user loggout!");
                f(null);
            }
        });
    };
    RandomBackendClass.prototype.getCurrentUserOrNull = function () {
        return this.currentUser;
    };
    RandomBackendClass.prototype.getCurrentUser = function () {
        return this.currentUser;
    };
    return RandomBackendClass;
}());
exports.RandomBackend = new RandomBackendClass();
//# sourceMappingURL=RandomBackend.js.map