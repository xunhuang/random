import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { SubscriptionListView } from './SubscriptionList';
import { Redirect, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import Routes from './Routes';
const namedurls = require("named-urls")

export const SubscriptionListPage = () => {
    let history = useHistory();
    let user = RandomBackend.getCurrentUser();

    const [selectedSub, setSelectedSub] = React.useState<WatchSubscription | undefined>(undefined);
    const [subs, setSubs] = React.useState<any>(undefined);
    const [reload, setReload] = React.useState<boolean>(false);
    React.useEffect(() => {
        user.subscriptions.find().then(data => {
            setSubs(data);
        });
    }, [reload]);

    if (!subs) return null;

    if (subs.length == 0) {
        return <Redirect to="/subnew" />
    }

    return <div>
        <h3>
            <Link to="/subnew">
                New Watch Site
            </Link>
        </h3>
        <SubscriptionListView subs={subs} subClicked={sub => {
            console.log("upldated selected sub");
            history.push(namedurls.reverse(Routes.subscriptionView, {
                subid: sub.id,
            }))
            setSelectedSub(sub);
        }} />
    </div >;
};