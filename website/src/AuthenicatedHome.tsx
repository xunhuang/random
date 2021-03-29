import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionForm } from './SubscriptionFormProperty';

export const AuthenticatedHome = () => {
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

    console.log(subs);

    return <div>
        <h1>
            AuthenticatedHome - {user.displayName}, {user.id}
        </h1>
        {
            (subs.length == 0) ? <SubscriptionForm sub={selectedSub}
                callback={() => {
                    setSelectedSub(undefined);
                    setReload(!reload);
                }} /> :
                <SubscriptionList subs={subs} subClicked={sub => {
                    console.log("upldated selected sub");
                    setSelectedSub(sub);
                }} />
        }
    </div >;
};
