import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import MUIDataTable from 'mui-datatables';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
function SubscriptionForm(props) {
    let user = RandomBackend.getCurrentUser();
    const schema = yup.object().shape({
        name: yup.string().required(),
        url: yup.string().url().required(),
    });
    const { register, handleSubmit, errors, reset } = useForm({
        resolver: yupResolver(schema)
    });
    const onSubmit = handleSubmit(({ name, url }) => {
        let sub = props.sub || new WatchSubscription();
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
    let sub = props.sub;
    return (_jsxs("div", { children: [sub ? _jsx("label", { children: "Update Subscription" }, void 0) :
                _jsx("label", { children: "New Subscription" }, void 0),
            _jsxs("form", Object.assign({ onSubmit: onSubmit }, { children: [_jsx("label", { children: "Name" }, void 0),
                    _jsx("input", { name: "name", ref: register, defaultValue: sub && sub.name }, void 0), errors.name && "Name is required", _jsx("label", { children: "URL" }, void 0),
                    _jsx("input", { name: "url", ref: register, defaultValue: sub && sub.url }, void 0), errors.url && "URL must be valid", _jsx("input", { type: "submit" }, void 0)] }), void 0)] }, void 0));
}
const SubscripionList = (props) => {
    const columns = [
        { label: 'Name', name: 'name' },
        { label: 'URL', name: 'url' },
    ];
    const options = {
        onRowsDelete: (rowsDeleted) => {
            let user = RandomBackend.getCurrentUser();
            rowsDeleted.data.map(d => {
                let subid = props.subs[d.dataIndex].id;
                user.subscriptions.delete(subid).then(() => {
                    console.log("deleted:" + subid);
                });
            });
        },
        onRowClick: (rowData, rowMeta) => {
            if (props.subClicked) {
                console.log("row clicked");
                props.subClicked(props.subs[rowMeta.dataIndex]);
            }
        }
    };
    return (_jsx("div", Object.assign({ style: { maxWidth: '100%' } }, { children: _jsx(MUIDataTable, { columns: columns, data: props.subs, title: 'Watch Subscriptions', options: options }, void 0) }), void 0));
};
export const AuthenicatedHome = () => {
    let user = RandomBackend.getCurrentUser();
    const [selectedSub, setSelectedSub] = React.useState(undefined);
    const [subs, setSubs] = React.useState(undefined);
    const [reload, setReload] = React.useState(false);
    React.useEffect(() => {
        user.subscriptions.find().then(data => {
            setSubs(data);
        });
    }, [reload]);
    return _jsxs("div", { children: [_jsxs("h1", { children: ["AuthenticatedHome - ", user.displayName, ", ", user.id] }, void 0),
            _jsx(SubscriptionForm, { sub: selectedSub, callback: () => {
                    console.log("hello");
                    setSelectedSub(undefined);
                    setReload(!reload);
                } }, void 0),
            _jsx(SubscripionList, { subs: subs, subClicked: sub => {
                    console.log("upldated selected sub");
                    setSelectedSub(sub);
                } }, void 0)] }, void 0);
};
