import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Input, TextField, FormControl } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import Routes from './Routes';
const namedurls = require("named-urls")

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
    const history = useHistory();
    const sub = props.sub;
    type FormData = {
        url: string;
        paused: boolean;
        skipNotification: boolean;
        input: string;
    };
    const schema = yup.object().shape({
        url: yup.string().url().required('Please enter website'),
    });
    const { register, handleSubmit, errors, control } = useForm<FormData>({
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
            history.push(namedurls.reverse(Routes.subscriptionView, {
                subid: sub.id,
            }));
        });
    });

    console.log(errors);
    return (
        <div>
            <h1>Edit Subscription</h1>
            <form onSubmit={onSubmit}>
                <Controller
                    name="url"
                    as={
                        <TextField
                            fullWidth
                            label="URL"
                            variant="outlined"
                            helperText={errors.url ? errors.url.message : null}
                        />
                    }
                    control={control}
                    defaultValue={sub.url}
                />
                <div>
                    <label>Pause</label>
                    <input type="checkbox" name="paused" ref={register} defaultChecked={sub.paused} />
                </div>
                <div>
                    <label>Skip Notifications</label>
                    <input type="checkbox" name="skipNotification" ref={register} defaultChecked={sub.skipNotification} />
                </div>
                <div>
                    <button type="submit" >
                        Save
                        </button>
                </div>
            </form>
        </div>
    );
}
