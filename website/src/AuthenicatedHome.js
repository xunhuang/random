import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import MUIDataTable from 'mui-datatables';
export const AuthenicatedHome = () => {
    let user = RandomBackend.getCurrentUser();
    const [subs, setSubs] = React.useState(undefined);
    const [reload, setReload] = React.useState(false);
    React.useEffect(() => {
        user.subscriptions.find().then(data => {
            setSubs(data);
        });
    }, [reload]);
    const columns = [
        { label: 'Title', name: 'name' },
        { label: 'Author', name: 'url' },
    ];
    const options = {
        filterType: 'checkbox'
    };
    return _jsxs("div", { children: [_jsxs("h1", { children: ["AuthenticatedHome - ", user.displayName, ", ", user.id] }, void 0),
            _jsx("div", Object.assign({ style: { maxWidth: '100%' } }, { children: _jsx(MUIDataTable, { columns: columns, data: subs, title: 'Watch Subscriptions' }, void 0) }), void 0),
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
