"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUser = exports.WatchSubscription = void 0;
/* eslint-disable import/first */ // not sure why line position matters
var fireorm_1 = require("fireorm");
var WatchSubscription = /** @class */ (function () {
    function WatchSubscription() {
    }
    return WatchSubscription;
}());
exports.WatchSubscription = WatchSubscription;
;
var AuthUser = /** @class */ (function () {
    function AuthUser() {
        this.displayName = null;
    }
    AuthUser_1 = AuthUser;
    AuthUser.fromFirebaseUser = function (user) {
        var u = new AuthUser_1();
        u.displayName = user.displayName;
        u.id = user.uid;
        // console.log("hello")
        return u;
    };
    AuthUser.prototype.uid = function () { return this.id; };
    AuthUser.prototype.subscriptionAdd = function (sub) {
        this.subscriptions.create(sub);
    };
    var AuthUser_1;
    __decorate([
        fireorm_1.SubCollection(WatchSubscription, "WathSubscriptions")
    ], AuthUser.prototype, "subscriptions", void 0);
    AuthUser = AuthUser_1 = __decorate([
        fireorm_1.Collection("AuthUsers")
    ], AuthUser);
    return AuthUser;
}());
exports.AuthUser = AuthUser;
//# sourceMappingURL=AuthUser.js.map