import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useHistory } from "react-router-dom";

interface SubscriptionFormProperty {
    sub?: WatchSubscription;
    callback?: () => void;
}
export function SubscriptionNew(props: SubscriptionFormProperty) {
    let history = useHistory();
    let user = RandomBackend.getCurrentUser();
    let [url, setURL] = React.useState("www.cnn.com");
    let [dataSubmitted, setDataSubmitted] = React.useState(false);
    type FormData = {
        url: string;
    };

    const schema = yup.object().shape({
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

    const onSubmit = handleSubmit(({ url }) => {
        console.log(url);
        url = url.startsWith("http") ? url : "https://" + url;
        /*
        setURL(url);
        setDataSubmitted(true);
        */
        // no pre-view for now just create the URL
        let sub = new WatchSubscription();
        sub.url = url;
        user.subscriptions.create(sub).then(function () {
            console.log("done creating subscriptions");
            if (props.callback) {
                props.callback();
            } else {
                history.push('/sub')
            }
        });
    });

    return (
        <div>
            <h1>Website to Watch?</h1>
            <form onSubmit={onSubmit}>
                <input name="url" ref={register} defaultValue={url} />
                <input type="submit" />
                <div>
                    {errors.url && "Please enter valid URL"}
                </div>
            </form>
            { dataSubmitted &&
                // this didnt work, cross site stuff. need cloud function to fetch
                <div>
                    <h4> {url}</h4>
                    <iframe src={url}></iframe>
                </div>
            }

        </div>
    );
}
