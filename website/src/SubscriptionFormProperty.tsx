import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Routes from './Routes';
import { Link } from 'react-router-dom';
import { RandomDataTable } from "./RandomDataTable"
import { DataRecord } from './CloudDB';
import MUIDataTable from 'mui-datatables';
import parse from 'html-react-parser';

interface SubscriptionFormProperty {
    sub?: WatchSubscription;
    callback?: () => void;
}

export function SubscriptionViewPage(props: any) {
    let user = RandomBackend.getCurrentUser();
    let subid = props.match.params.subid;
    const [sub, setSub] = React.useState<WatchSubscription | undefined>(undefined);
    const [runRecords, setRunRecords] = React.useState<DataRecord[] | undefined>(undefined);

    const [selectDataUrl, setSelectedDataUrl] = React.useState<string | undefined>(undefined);
    console.log(subid);
    React.useEffect(() => {
        user.subscriptions.findById(subid).then(data => {
            let mysub = data as WatchSubscription;
            RandomDataTable.findTableRecords(
                mysub.storageTableID(user)
            ).then((records: DataRecord[]) => {
                setSub(mysub);
                setRunRecords(records);
            });
        });
    }, [subid]);
    if (!sub || !runRecords) return null;

    console.log(runRecords);

    const columns = [
        { label: 'Time', name: 'timestampReadable' },
        { label: 'Data URL', name: 'dataUrl' },
    ];

    const options = {
        onRowClick: (rowData: string[], rowMeta: { dataIndex: number; rowIndex: number; }) => {
            console.log("row clicked");
            let record = runRecords[rowMeta.dataIndex];
            record.fetchData().then(data => {
                setSelectedDataUrl(data);
            });
        }
    };

    return <div>
        <h4>
            <Link to={Routes.subscriptionlist}> Back </Link>
        </h4>
        <h3>
            {sub.url}
        </h3>

        <MUIDataTable
            columns={columns}
            data={runRecords}
            title='Run Records'
            options={options}
        />
        {selectDataUrl && parse(selectDataUrl as string)}

    </div>
}
export function SubscriptionEditPage(props: SubscriptionFormProperty) {
    let user = RandomBackend.getCurrentUser();
    type FormData = {
        name: string;
        url: string;
    };
    const schema = yup.object().shape({
        name: yup.string().required(),
        url: yup.string()
            .matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'Enter correct url!'
            )
            .required('Please enter website'),
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
            {sub ? <label>Update Subscription</label> :
                <label>New Subscription</label>}
            <form onSubmit={onSubmit}>
                <label>Name</label>
                <input name="name" ref={register} defaultValue={sub && sub.name} />
                {errors.name && "Name is required"}
                <label>URL</label>
                <input name="url" ref={register} defaultValue={sub && sub.url} />
                {errors.url && "URL must be valid"}
                <input type="submit" />
            </form>
        </div>
    );
}
