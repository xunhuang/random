import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { SubscriptionListView } from './SubscriptionList';
import { SubscriptionForm } from './SubscriptionFormProperty';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

export const SubscriptionListPage = () => {
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
            setSelectedSub(sub);
        }} />
    </div >;
};
