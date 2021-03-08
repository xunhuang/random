"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomBackend = void 0;
var AuthUser_1 = require("./AuthUser");
require("@firebase/firestore");
require("@firebase/auth");
var firebase = require('firebase/app').default;
var firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
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
                console.log("newuser 2 !");
                _this.currentUser = new AuthUser_1.AuthUser(user);
            }
            else {
                console.log("user loggout!");
            }
            f(_this.currentUser);
        });
    };
    RandomBackendClass.prototype.getCurrentUser = function () {
        return this.currentUser;
    };
    RandomBackendClass.prototype.getCurrentUserNotNull = function () {
        return this.currentUser;
    };
    return RandomBackendClass;
}());
exports.RandomBackend = new RandomBackendClass();
//# sourceMappingURL=RandomBackend.js.map