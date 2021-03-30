import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

interface SubscriptionFormProperty {
    sub?: WatchSubscription;
    callback?: () => void;
}
export function SubscriptionForm(props: SubscriptionFormProperty) {
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
