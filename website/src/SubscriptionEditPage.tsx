import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Input, TextField, FormControl, Box, FormControlLabel, Checkbox } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import Routes from './Routes';
import PropTypes from 'prop-types'

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
        resolver: yupResolver(schema),
        defaultValues: {
            paused: false,
            skipNotification: false,
        }

    });

    const onSubmit = handleSubmit(({ url, paused, skipNotification }) => {
        let user = RandomBackend.getCurrentUser();
        let newsub = sub;
        newsub.url = url;
        newsub.paused = paused;
        newsub.skipNotification = skipNotification;
        console.log(paused);
        console.log(newsub);
        user.subscriptions.update(newsub).then(function () {
            // history.push(namedurls.reverse(Routes.subscriptionView, {
            //     subid: sub.id,
            // }));
        });
    });

    return (
        <div>
            <h1>Edit Subscription</h1>
            <form onSubmit={onSubmit}>
                <Box component="span" display="block" p={2} m={1} bgcolor="background.paper">
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
                </Box>
                <Box component="span" display="block" p={1} m={1} bgcolor="background.paper">
                    <FormControlLabel
                        control={
                            <Checkbox defaultChecked={sub.paused}
                                name="paused"
                                inputRef={register}
                            />
                        }
                        label={"Paused"}
                    />
                </Box>
                <Box component="span" display="block" p={1} m={1} bgcolor="background.paper">
                    <FormControlLabel
                        control={
                            <Checkbox defaultChecked={sub.skipNotification}
                                name="skipNotification"
                                inputRef={register}
                            />
                        }
                        label={"Skip Notifications"}
                    />
                </Box>
                <Box component="span" display="block" p={1} m={1} bgcolor="background.paper">
                    <button type="submit" >
                        Save
                        </button>
                </Box>
            </form>
        </div >
    );
}
