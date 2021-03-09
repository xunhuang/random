import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import MUIDataTable from 'mui-datatables';

export const AuthenicatedHome = () => {
    let user = RandomBackend.getCurrentUser();
    const [subs, setSubs] = React.useState<any>(undefined);
    const [reload, setReload] = React.useState<boolean>(false);
    React.useEffect(() => {
        user.subscriptions.find().then(data => {
            setSubs(data);
        });
    }, [reload]);

    const columns = [
        { label: 'Title', name: 'name' },
        { label: 'Author', name: 'url' },
        // { label: 'Page Count', name: 'num_pages', options: { sort: true } },
        // { label: 'Rating', name: 'rating' }
    ];
    const options = {
        filterType: 'checkbox'
    };

    return <div>
        <h1>
            AuthenticatedHome - {user.displayName}, {user.id}
        </h1>
        <div style={{ maxWidth: '100%' }}>
            <MUIDataTable
                columns={columns}
                data={subs}
                title='Watch Subscriptions'
            />
        </div>
        <p onClick={(event) => {
            let user = RandomBackend.getCurrentUser();
            let sub = new WatchSubscription();
            sub.name = "hey hey";
            sub.url = "https://cnn.com";
            user.subscriptions.create(sub).then(function () {
                console.log("done creating subscriptions");
                setReload(!reload);
            });
        }}>
            Add Subscription
        </p>
    </div >;
};
