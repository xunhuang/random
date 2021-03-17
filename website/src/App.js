"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
require("./App.css");
var react_router_dom_2 = require("react-router-dom");
var AuthUserContext_1 = require("./AuthUserContext");
var RandomBackend_1 = require("./RandomBackend");
var AuthenicatedHome_1 = require("./AuthenicatedHome");
var Page404 = function () {
    return react_1.default.createElement("h1", null, " Oops! That page couldn't be found. ");
};
var UserSubscriptions = function () {
    var user = RandomBackend_1.RandomBackend.getCurrentUser();
    return react_1.default.createElement("h1", null,
        " My Subscription for ",
        user.displayName,
        ", ",
        user.id,
        " ");
};
var App = function (props) {
    return react_1.default.createElement(react_router_dom_2.BrowserRouter, null,
        react_1.default.createElement("header", null,
            react_1.default.createElement("div", { className: "App" },
                react_1.default.createElement(Home, __assign({}, props)))));
};
function AuthenticatedApp() {
    return react_1.default.createElement("div", null,
        react_1.default.createElement(SafeRoutes, null),
        react_1.default.createElement("p", { onClick: function (event) {
                RandomBackend_1.RandomBackend.logout();
            } }, "Logout"));
}
function UnauthenticatedApp() {
    return react_1.default.createElement("h1", null,
        " Un-AuthenticatedApp xxx",
        react_1.default.createElement("p", { onClick: function (event) {
                console.log("clicked");
                RandomBackend_1.RandomBackend.login();
            } }, "Sign in here"));
}
function Home(props) {
    var _a = react_1.default.useState(undefined), authUser = _a[0], setAuthUser = _a[1];
    react_1.default.useEffect(function () {
        RandomBackend_1.RandomBackend.userStatusChange(function (user) {
            setAuthUser(user);
        });
    }, []);
    if (authUser === undefined)
        return react_1.default.createElement("h2", null, " Loading");
    return (authUser) ?
        react_1.default.createElement(AuthUserContext_1.AuthUserContext.Provider, { value: authUser },
            react_1.default.createElement(AuthenticatedApp, null))
        : react_1.default.createElement(UnauthenticatedApp, null);
}
var SafeRoutes = react_router_dom_1.withRouter(function (props) {
    /* this came from the 404 redirect */
    if (props.location.search.startsWith("?/")) {
        return react_1.default.createElement(react_router_dom_1.Redirect, { to: props.location.search.slice(1) });
    }
    return (react_1.default.createElement(react_router_dom_1.Switch, null,
        react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/", component: AuthenicatedHome_1.AuthenicatedHome }),
        react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/sub", component: UserSubscriptions }),
        react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "*", component: Page404 })));
});
exports.default = App;
//# sourceMappingURL=App.js.map