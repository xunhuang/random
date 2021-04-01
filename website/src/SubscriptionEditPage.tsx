import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

export function SubscriptionEditPage(props: any) {
    let user = RandomBackend.getCurrentUser();
    let subid = props.match.params.subid;
    const [sub, setSub] = React.useState<WatchSubscription | undefined>(undefined);
    React.useEffect(() => {
        user.findSubscription(subid).then(data => {
            setSub(data as WatchSubscription);
        });
    }, [subid]);
    if (!sub) return <div>loading</div>;
    return <SubscriptionEditView sub={sub} />
}

function SubscriptionEditView(props: { sub: WatchSubscription }) {
    const sub = props.sub;
    type FormData = {
        url: string;
        paused: boolean;
        skipNotification: boolean;
    };
    const schema = yup.object().shape({
        url: yup.string().url().required('Please enter website'),
    });
    const { register, handleSubmit, errors, reset } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit = handleSubmit(({ url, paused, skipNotification }) => {
        let user = RandomBackend.getCurrentUser();
        let newsub = sub;
        newsub.url = url;
        newsub.paused = paused;
        newsub.skipNotification = skipNotification;
        console.log(newsub);
        user.subscriptions.update(newsub).then(function () {
            //     // console.log("done updating subscriptions");
            //     // if (props.callback) { props.callback(); }
        });
    });

    console.log(errors);
    return (
        <div>
            <h1>Edit Subscription</h1>

            <form onSubmit={onSubmit}>
                <div>
                    <label>URL</label>
                    <input name="url" ref={register} defaultValue={sub.url} />
                    {errors.url && "URL must be valid"}
                </div>
                <div>
                    <label>Pause</label>
                    <input type="checkbox" name="paused" ref={register} defaultChecked={sub.paused} />
                </div>
                <div>
                    <label>Skip Notifications</label>
                    <input type="checkbox" name="skipNotification" ref={register} defaultChecked={sub.skipNotification} />
                </div>
                <div>
                    <input type="submit" />
                </div>
            </form>
        </div>
    );
}
