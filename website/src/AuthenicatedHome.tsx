import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import MUIDataTable from 'mui-datatables';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

interface SubscriptionFormProperty {
    sub?: WatchSubscription;
    callback?: () => void;
}

function SubscriptionForm(props: SubscriptionFormProperty) {
    let user = RandomBackend.getCurrentUser();
    type FormData = {
        name: string;
        url: string;
    };
    const schema = yup.object().shape({
        name: yup.string().required(),
        url: yup.string().url().required(),
    });
    const { register, handleSubmit, errors, reset } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit = handleSubmit(({ name, url }) => {
        let sub = props.sub || new WatchSubscription();
        sub.name = name;
        sub.url = url;
        if (!props.sub) {
            user.subscriptions.create(sub).then(function () {
                console.log("done creating subscriptions");
                if (props.callback) { props.callback(); }
                reset();
            });
        } else {
            user.subscriptions.update(sub).then(function () {
                console.log("done updating subscriptions");
                if (props.callback) { props.callback(); }
            });
        }
    });

    let sub = props.sub;
    return (
        <div>
            {
                sub ?
                    <label>Update Subscription</label> :
                    <label>New Subscription</label>
            }
            <form onSubmit={onSubmit}>
                <label>Name</label>
                <input name="name" ref={register} defaultValue={sub && sub.name} />
                {/* // <input name="name" ref={register} value={""} /> */}
                {errors.name && "Name is required"}
                <label>URL</label>
                <input name="url" ref={register} defaultValue={sub && sub.url} />
                {errors.url && "URL must be valid"}
                <input type="submit" />
            </form>
        </div>
    );
}

interface SubscriptionListProperty {
    subs: WatchSubscription[];
    subClicked?: (sub: WatchSubscription) => void;
}

const SubscripionList = (props: SubscriptionListProperty) => {
    const columns = [
        { label: 'Title', name: 'name' },
        { label: 'Author', name: 'url' },
    ];

    const options = {
        onRowsDelete: (rowsDeleted: { data: any[]; }) => {
            let user = RandomBackend.getCurrentUser();
            rowsDeleted.data.map(d => {
                let subid = props.subs[d.dataIndex].id;
                user.subscriptions.delete(subid).then(() => {
                    console.log("deleted:" + subid);
                })
            });
        },
        onRowClick: (rowData: string[], rowMeta: { dataIndex: number, rowIndex: number }) => {
            if (props.subClicked) {
                console.log("row clicked")
                props.subClicked(props.subs[rowMeta.dataIndex]);
            }
        }
    };

    return (
        <div style={{ maxWidth: '100%' }}>
            <MUIDataTable
                columns={columns}
                data={props.subs}
                title='Watch Subscriptions'
                options={options}
            />
        </div>);
};

export const AuthenicatedHome = () => {
    let user = RandomBackend.getCurrentUser();

    const [selectedSub, setSelectedSub] = React.useState<WatchSubscription | undefined>(undefined);
    const [subs, setSubs] = React.useState<any>(undefined);
    const [reload, setReload] = React.useState<boolean>(false);
    React.useEffect(() => {
        user.subscriptions.find().then(data => {
            setSubs(data);
        });
    }, [reload]);

    return <div>
        <h1>
            AuthenticatedHome - {user.displayName}, {user.id}
        </h1>
        <SubscriptionForm sub={selectedSub}
            callback={() => {
                console.log("hello");
                setSelectedSub(undefined);
                setReload(!reload);
            }} />
        <SubscripionList subs={subs} subClicked={sub => {
            console.log("upldated selected sub");
            setSelectedSub(sub);
        }} />
    </div >;
};
