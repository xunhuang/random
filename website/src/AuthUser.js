var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthUser_1;
/* eslint-disable import/first */ // not sure why line position matters
import { Collection, SubCollection } from 'fireorm';
export class WatchSubscription {
}
;
let AuthUser = AuthUser_1 = class AuthUser {
    constructor() {
        this.displayName = null;
    }
    static fromFirebaseUser(user) {
        let u = new AuthUser_1();
        u.displayName = user.displayName;
        u.id = user.uid;
        return u;
    }
    uid() { return this.id; }
    subscriptionAdd(sub) {
        this.subscriptions.create(sub);
    }
};
__decorate([
    SubCollection(WatchSubscription),
    __metadata("design:type", Object)
], AuthUser.prototype, "subscriptions", void 0);
AuthUser = AuthUser_1 = __decorate([
    Collection()
], AuthUser);
export { AuthUser };
