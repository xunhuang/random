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
exports.SubscriptionForm = void 0;
var react_1 = __importDefault(require("react"));
var RandomBackend_1 = require("./RandomBackend");
var AuthUser_1 = require("./AuthUser");
var react_hook_form_1 = require("react-hook-form");
var yup_1 = require("@hookform/resolvers/yup");
var yup = __importStar(require("yup"));
function SubscriptionForm(props) {
    var user = RandomBackend_1.RandomBackend.getCurrentUser();
    var schema = yup.object().shape({
        name: yup.string().required(),
        url: yup.string()
            .matches(/((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/, 'Enter correct url!')
            .required('Please enter website'),
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
exports.SubscriptionForm = SubscriptionForm;
//# sourceMappingURL=SubscriptionFormProperty.js.map