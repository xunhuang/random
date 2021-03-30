"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionList = void 0;
var react_1 = __importDefault(require("react"));
var RandomBackend_1 = require("./RandomBackend");
var mui_datatables_1 = __importDefault(require("mui-datatables"));
var SubscriptionList = function (props) {
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
exports.SubscriptionList = SubscriptionList;
//# sourceMappingURL=SubscriptionList.js.map