import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthUserContext } from './AuthUserContext';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
const Page404 = () => {
    return _jsx("h1", { children: " Oops! That page couldn't be found. " }, void 0);
};
const AuthenicatedHome = () => {
    let user = RandomBackend.getCurrentUser();
    const [subs, setSubs] = React.useState(undefined);
    const [reload, setReload] = React.useState(false);
    React.useEffect(() => {
        user.subscriptions.find().then(data => {
            setSubs(data);
        });
    }, [reload]);
    if (subs) {
        console.log(subs);
    }
    return _jsxs("h1", { children: ["AuthenticatedHome - ", user.displayName, ", ", user.id, subs &&
                subs.map((sub) => _jsxs("li", { children: [" ", sub.name, ",  ", sub.url, " "] }, sub.id)),
            _jsx("p", Object.assign({ onClick: (event) => {
                    let user = RandomBackend.getCurrentUser();
                    let sub = new WatchSubscription();
                    sub.name = "hey hey";
                    sub.url = "https://cnn.com";
                    user.subscriptions.create(sub).then(function () {
                        console.log("done creating subscriptions");
                        setReload(!reload);
                    });
                } }, { children: "Add Subscription" }), void 0)] }, void 0);
};
const UserSubscriptions = () => {
    let user = RandomBackend.getCurrentUser();
    return _jsxs("h1", { children: [" My Subscription for ", user.displayName, ", ", user.id, " "] }, void 0);
};
const App = (props) => {
    return _jsx(BrowserRouter, { children: _jsx("header", { children: _jsx("div", Object.assign({ className: "App" }, { children: _jsx(Home, Object.assign({}, props), void 0) }), void 0) }, void 0) }, void 0);
};
function AuthenticatedApp() {
    return _jsxs("div", { children: [_jsx(SafeRoutes, {}, void 0),
            _jsx("p", Object.assign({ onClick: (event) => {
                    RandomBackend.logout();
                } }, { children: "Logout" }), void 0)] }, void 0);
}
function UnauthenticatedApp() {
    return _jsxs("h1", { children: [" Un-AuthenticatedApp xxx", _jsx("p", Object.assign({ onClick: (event) => {
                    console.log("clicked");
                    RandomBackend.login();
                } }, { children: "Sign in here" }), void 0)] }, void 0);
}
function Home(props) {
    const [authUser, setAuthUser] = React.useState(undefined);
    React.useEffect(() => {
        RandomBackend.userStatusChange(function (user) {
            setAuthUser(user);
        });
    }, []);
    if (authUser === undefined)
        return _jsx("h2", { children: " Loading" }, void 0);
    return (authUser) ?
        _jsx(AuthUserContext.Provider, Object.assign({ value: authUser }, { children: _jsx(AuthenticatedApp, {}, void 0) }), void 0)
        : _jsx(UnauthenticatedApp, {}, void 0);
}
const SafeRoutes = withRouter((props) => {
    /* this came from the 404 redirect */
    if (props.location.search.startsWith("?/")) {
        return _jsx(Redirect, { to: props.location.search.slice(1) }, void 0);
    }
    return (_jsxs(Switch, { children: [_jsx(Route, { exact: true, path: "/", component: AuthenicatedHome }, void 0),
            _jsx(Route, { exact: true, path: "/sub", component: UserSubscriptions }, void 0),
            _jsx(Route, { exact: true, path: "*", component: Page404 }, void 0)] }, void 0));
});
export default App;
