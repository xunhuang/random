(this.webpackJsonpwebsite=this.webpackJsonpwebsite||[]).push([[0],{18:function(e,t,n){"use strict";var u=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(2)),a=u(n(20));n(24);var o=u(n(25)),l=u(n(39));a.default.render(r.default.createElement(r.default.StrictMode,null,r.default.createElement(o.default,null)),document.getElementById("root")),l.default()},24:function(e,t,n){},25:function(e,t,n){"use strict";var u=this&&this.__assign||function(){return(u=Object.assign||function(e){for(var t,n=1,u=arguments.length;n<u;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)},r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var a=r(n(2)),o=n(16);n(30);var l=n(16),c=n(31),i=n(32),d=function(){return a.default.createElement("h1",null," Oops! That page couldn't be found. ")},s=function(){var e=i.RandomBackend.getCurrentUserNotNull();return a.default.createElement("h1",null," AuthenticatedHome - ",e.displayName,", ",e.uid," ")},f=function(){var e=i.RandomBackend.getCurrentUserNotNull();return a.default.createElement("h1",null," My Subscription for ",e.displayName,", ",e.uid," ")};function h(){return a.default.createElement("div",null,a.default.createElement(v,null),a.default.createElement("p",{onClick:function(e){i.RandomBackend.logout()}},"Logout"))}function p(){return a.default.createElement("h1",null," Un-AuthenticatedApp xxx",a.default.createElement("p",{onClick:function(e){console.log("clicked"),i.RandomBackend.login()}},"Sign in here"))}function m(e){var t=a.default.useState(void 0),n=t[0],u=t[1];return a.default.useEffect((function(){i.RandomBackend.userStatusChange((function(e){u(e)}))}),[]),void 0===n?a.default.createElement("h2",null," Loading"):n?a.default.createElement(c.AuthUserContext.Provider,{value:n},a.default.createElement(h,null)):a.default.createElement(p,null)}var v=o.withRouter((function(e){return e.location.search.startsWith("?/")?a.default.createElement(o.Redirect,{to:e.location.search.slice(1)}):a.default.createElement(o.Switch,null,a.default.createElement(o.Route,{exact:!0,path:"/",component:s}),a.default.createElement(o.Route,{exact:!0,path:"/sub",component:f}),a.default.createElement(o.Route,{exact:!0,path:"*",component:d}))}));t.default=function(e){return a.default.createElement(l.BrowserRouter,null,a.default.createElement("header",null,a.default.createElement("div",{className:"App"},a.default.createElement(m,u({},e)))))}},30:function(e,t,n){},31:function(e,t,n){"use strict";var u=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.AuthUserContext=void 0;var r=u(n(2));t.AuthUserContext=r.default.createContext(void 0)},32:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.RandomBackend=void 0;var u=n(33);n(34),n(36);var r=n(37).default,a=n(38);r.apps.length||r.initializeApp(a);var o=function(){function e(){this.currentUser=null}return e.prototype.login=function(){var e=new r.auth.GoogleAuthProvider;r.auth().signInWithPopup(e).then((function(e){console.log(e.user)})).catch((function(e){console.log(e)}))},e.prototype.logout=function(){this.currentUser=null,r.auth().signOut()},e.prototype.userStatusChange=function(e){var t=this;r.auth().onAuthStateChanged((function(n){n?(console.log("newuser 2 !"),t.currentUser=new u.AuthUser(n)):console.log("user loggout!"),e(t.currentUser)}))},e.prototype.getCurrentUser=function(){return this.currentUser},e.prototype.getCurrentUserNotNull=function(){return this.currentUser},e}();t.RandomBackend=new o},33:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.AuthUser=void 0;var u=function(e){this.displayName=e.displayName,this.uid=e.uid};t.AuthUser=u},38:function(e){e.exports=JSON.parse('{"projectId":"myrandomwatch-b4b41","appId":"1:458223764382:web:ad550ac9d5d240982d0c8f","databaseURL":"https://myrandomwatch-b4b41-default-rtdb.firebaseio.com","storageBucket":"myrandomwatch-b4b41.appspot.com","locationId":"us-central","apiKey":"AIzaSyCfD31xo4THGYQ5_Y0-VPVT71T3sB2YxL0","authDomain":"myrandomwatch-b4b41.firebaseapp.com","messagingSenderId":"458223764382","measurementId":"G-F2BBYE9XWJ"}')},39:function(e,t,n){"use strict";var u=this&&this.__createBinding||(Object.create?function(e,t,n,u){void 0===u&&(u=n),Object.defineProperty(e,u,{enumerable:!0,get:function(){return t[n]}})}:function(e,t,n,u){void 0===u&&(u=n),e[u]=t[n]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&u(t,e,n);return r(t,e),t};Object.defineProperty(t,"__esModule",{value:!0});t.default=function(e){e&&e instanceof Function&&Promise.resolve().then((function(){return a(n(40))})).then((function(t){var n=t.getCLS,u=t.getFID,r=t.getFCP,a=t.getLCP,o=t.getTTFB;n(e),u(e),r(e),a(e),o(e)}))}}},[[18,1,2]]]);
//# sourceMappingURL=main.0bdd88dc.chunk.js.map