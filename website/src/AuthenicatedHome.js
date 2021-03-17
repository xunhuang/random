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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenicatedHome = void 0;
var react_1 = __importDefault(require("react"));
var RandomBackend_1 = require("./RandomBackend");
var AuthUser_1 = require("./AuthUser");
var mui_datatables_1 = __importDefault(require("mui-datatables"));
var react_hook_form_1 = require("react-hook-form");
var yup_1 = require("@hookform/resolvers/yup");
var yup = __importStar(require("yup"));
function SubscriptionForm(props) {
    var user = RandomBackend_1.RandomBackend.getCurrentUser();
    var schema = yup.object().shape({
        name: yup.string().required(),
        url: yup.string().url().required(),
    });
    var _a = react_hook_form_1.useForm({
        resolver: yup_1.yupResolver(schema)
    }), register = _a.register, handleSubmit = _a.handleSubmit, errors = _a.errors, reset = _a.reset;
    var onSubmit = handleSubmit(function (_a) {
        var name = _a.name, url = _a.url;
        var sub = props.sub || new AuthUser_1.WatchSubscription();
        sub.name = name;
        sub.url = url;
        if (!props.sub) {
            user.subscriptions.create(sub).then(function () {
                console.log("done creating subscriptions");
                if (props.callback) {
                    props.callback();
                }
                reset();
            });
        }
        else {
            user.subscriptions.update(sub).then(function () {
                console.log("done updating subscriptions");
                if (props.callback) {
                    props.callback();
                }
            });
        }
    });
    var sub = props.sub;
    return (react_1.default.createElement("div", null,
        sub ? react_1.default.createElement("label", null, "Update Subscription") :
            react_1.default.createElement("label", null, "New Subscription"),
        react_1.default.createElement("form", { onSubmit: onSubmit },
            react_1.default.createElement("label", null, "Name"),
            react_1.default.createElement("input", { name: "name", ref: register, defaultValue: sub && sub.name }),
            errors.name && "Name is required",
            react_1.default.createElement("label", null, "URL"),
            react_1.default.createElement("input", { name: "url", ref: register, defaultValue: sub && sub.url }),
            errors.url && "URL must be valid",
            react_1.default.createElement("input", { type: "submit" }))));
}
var SubscripionList = function (props) {
    var columns = [
        { label: 'Name', name: 'name' },
        { label: 'URL', name: 'url' },
    ];
    var options = {
        onRowsDelete: function (rowsDeleted) {
            var user = RandomBackend_1.RandomBackend.getCurrentUser();
            rowsDeleted.data.map(function (d) {
                var subid = props.subs[d.dataIndex].id;
                user.subscriptions.delete(subid).then(function () {
                    console.log("deleted:" + subid);
                });
            });
        },
        onRowClick: function (rowData, rowMeta) {
            if (props.subClicked) {
                console.log("row clicked");
                props.subClicked(props.subs[rowMeta.dataIndex]);
            }
        }
    };
    return (react_1.default.createElement("div", { style: { maxWidth: '100%' } },
        react_1.default.createElement(mui_datatables_1.default, { columns: columns, data: props.subs, title: 'Watch Subscriptions', options: options })));
};
var AuthenicatedHome = function () {
    var user = RandomBackend_1.RandomBackend.getCurrentUser();
    var _a = react_1.default.useState(undefined), selectedSub = _a[0], setSelectedSub = _a[1];
    var _b = react_1.default.useState(undefined), subs = _b[0], setSubs = _b[1];
    var _c = react_1.default.useState(false), reload = _c[0], setReload = _c[1];
    react_1.default.useEffect(function () {
        user.subscriptions.find().then(function (data) {
            setSubs(data);
        });
    }, [reload]);
    return react_1.default.createElement("div", null,
        react_1.default.createElement("h1", null,
            "AuthenticatedHome - ",
            user.displayName,
            ", ",
            user.id),
        react_1.default.createElement(SubscriptionForm, { sub: selectedSub, callback: function () {
                console.log("hello");
                setSelectedSub(undefined);
                setReload(!reload);
            } }),
        react_1.default.createElement(SubscripionList, { subs: subs, subClicked: function (sub) {
                console.log("upldated selected sub");
                setSelectedSub(sub);
            } }));
};
exports.AuthenicatedHome = AuthenicatedHome;
//# sourceMappingURL=AuthenicatedHome.js.map