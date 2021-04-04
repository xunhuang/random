import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useHistory } from "react-router-dom";
import Routes from './Routes';
import { CircularProgress, LinearProgress } from '@material-ui/core';
const superagent = require('superagent');

interface SubscriptionFormProperty {
    sub?: WatchSubscription;
    callback?: () => void;
}

const defaultsite = "https://news.ycombinator.com/";
const scraperurl = "https://puppy-capsc6nslq-uc.a.run.app";
// const scraperurl = "http://localhost:8080";

export function SubscriptionNew(props: SubscriptionFormProperty) {
    let history = useHistory();
    let user = RandomBackend.getCurrentUser();
    let [url, setURL] = React.useState(defaultsite);
    let [dataSubmitted, setDataSubmitted] = React.useState(false);
    let [pngBase64, setPngBase64] = React.useState(undefined);
    let [loadingPreview, setLoadingPreview] = React.useState(false);
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
    const { register, handleSubmit, errors, reset, getValues, trigger } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onRealSubmit = handleSubmit(({ url }) => {
        url = url.startsWith("http") ? url : "https://" + url;
        let sub = new WatchSubscription();
        sub.url = url;
        user.subscriptions.create(sub).then(function () {
            console.log("done creating subscriptions");
            if (props.callback) {
                props.callback();
            } else {
                history.push(Routes.subscriptionlist);
            }
        });
    });

    const onPreview = () => {
        trigger().then((ok: boolean) => {
            if (!ok) {
                console.log("validation error");
                return;
            }
            let url = getValues().url;
            url = url.startsWith("http") ? url : "https://" + url;

            console.log("loading " + url)

            setLoadingPreview(true);
            superagent.get(scraperurl)
                .query({
                    url: url
                }).then((res: any) => {
                    console.log(res);
                    let body = JSON.parse(res.text);
                    setLoadingPreview(false);
                    setPngBase64(body.image);
                });

        });

    };

    return (
        <div>
            <h1>Website to Watch?</h1>
            <form onSubmit={e => { e.preventDefault(); }}>
                <input name="url" ref={register} defaultValue={url} onKeyDown={
                    function (e) {
                        if (e.key === 'Enter') {
                            onPreview();
                        }
                    }
                } />
                <button type="button"
                    onClick={onPreview}>Preview</button>
                <button type="button" onClick={onRealSubmit}>Subscribe</button>
                <div>
                    {errors.url && "Please enter valid URL"}
                </div>
            </form>
            {dataSubmitted &&
                // this didnt work, cross site stuff. need cloud function to fetch
                <div>
                    <h4> {url}</h4>
                    <iframe src={url}></iframe>
                </div>
            }
            {loadingPreview && <LinearProgress />}
            {pngBase64 && <img src={`data:image/png;base64,${pngBase64}`} />}

        </div>
    );
}
