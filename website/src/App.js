import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthUserContext } from './AuthUserContext';
import { GetCurrentAuthUser } from "./AuthUser";
require("@firebase/firestore");
require("@firebase/auth");
const firebase = require('firebase/app').default;
const firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const googleSignInPopup = (success, fail) => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
        if (success) {
            success(result.user);
        }
    }).catch(function (error) {
        if (fail) {
            console.log(error);
            fail(error);
        }
    });
};
const Page404 = () => {
    return _jsx("h1", { children: " Oops! That page couldn't be found. " }, void 0);
};
const AuthenicatedHome = () => {
    let user = GetCurrentAuthUser();
    return _jsxs("h1", { children: [" AuthenticatedHome - ", user.displayName, ", ", user.uid, " "] }, void 0);
};
const UserSubscriptions = () => {
    // let user = React.useContext(AuthUserContext) as any;
    let user = GetCurrentAuthUser();
    return _jsxs("h1", { children: [" My Subscription for ", user.displayName, ", ", user.uid, " "] }, void 0);
};
const App = (props) => {
    return _jsx(BrowserRouter, { children: _jsx("header", { children: _jsx("div", Object.assign({ className: "App" }, { children: _jsx(Home, Object.assign({}, props), void 0) }), void 0) }, void 0) }, void 0);
};
function AuthenticatedApp() {
    return _jsxs("div", { children: [_jsx(SafeRoutes, {}, void 0),
            _jsx("p", Object.assign({ onClick: (event) => {
                    firebase.auth().signOut();
                } }, { children: "Logout" }), void 0)] }, void 0);
}
function UnauthenticatedApp() {
    return _jsxs("h1", { children: [" Un-AuthenticatedApp", _jsx("p", Object.assign({ onClick: (event) => {
                    googleSignInPopup(null, null);
                } }, { children: "Sign in here" }), void 0)] }, void 0);
}
function Home(props) {
    const [authUser, setAuthUser] = React.useState(undefined);
    React.useEffect(() => {
        firebase.auth().onAuthStateChanged(function (user) {
            setAuthUser(user);
        });
    });
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
