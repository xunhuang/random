import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import MUIDataTable from 'mui-datatables';

interface SubscriptionListProperty {
    subs: WatchSubscription[];
    subClicked?: (sub: WatchSubscription) => void;
}
export const SubscriptionListView = (props: SubscriptionListProperty) => {
    const columns = [
        { label: 'Name', name: 'name' },
        { label: 'URL', name: 'url' },
    ];

    const options = {
        onRowsDelete: (rowsDeleted: { data: any[]; }) => {
            let user = RandomBackend.getCurrentUser();
            rowsDeleted.data.map(d => {
                let subid = props.subs[d.dataIndex].id;
                user.subscriptions.delete(subid).then(() => {
                    console.log("deleted:" + subid);
                });
            });
        },
        onRowClick: (rowData: string[], rowMeta: { dataIndex: number; rowIndex: number; }) => {
            if (props.subClicked) {
                console.log("row clicked");
                props.subClicked(props.subs[rowMeta.dataIndex]);
            }
        }
    };

    return (
        <div style={{ maxWidth: '100%' }}>
            <MUIDataTable
                columns={columns}
                data={props.subs}
                title='Watch Sites'
                options={options} />
        </div>);
};
