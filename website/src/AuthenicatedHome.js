"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedHome = void 0;
var react_1 = __importDefault(require("react"));
var RandomBackend_1 = require("./RandomBackend");
var SubscriptionList_1 = require("./SubscriptionList");
var SubscriptionFormProperty_1 = require("./SubscriptionFormProperty");
var AuthenticatedHome = function () {
    var user = RandomBackend_1.RandomBackend.getCurrentUser();
    var _a = react_1.default.useState(undefined), selectedSub = _a[0], setSelectedSub = _a[1];
    var _b = react_1.default.useState(undefined), subs = _b[0], setSubs = _b[1];
    var _c = react_1.default.useState(false), reload = _c[0], setReload = _c[1];
    react_1.default.useEffect(function () {
        user.subscriptions.find().then(function (data) {
            setSubs(data);
        });
    }, [reload]);
    if (!subs)
        return null;
    console.log(subs);
    return react_1.default.createElement("div", null,
        react_1.default.createElement("h1", null,
            "AuthenticatedHome - ",
            user.displayName,
            ", ",
            user.id),
        (subs.length == 0) ? react_1.default.createElement(SubscriptionFormProperty_1.SubscriptionForm, { sub: selectedSub, callback: function () {
                setSelectedSub(undefined);
                setReload(!reload);
            } }) :
            react_1.default.createElement(SubscriptionList_1.SubscriptionList, { subs: subs, subClicked: function (sub) {
                    console.log("upldated selected sub");
                    setSelectedSub(sub);
                } }));
};
exports.AuthenticatedHome = AuthenticatedHome;
//# sourceMappingURL=AuthenicatedHome.js.map