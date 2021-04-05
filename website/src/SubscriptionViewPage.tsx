import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { WatchSubscription } from "./AuthUser";
import Routes from './Routes';
import { Link } from 'react-router-dom';
import { RandomDataTable } from "./RandomDataTable"
import { DataRecord } from './CloudDB';
import parse from 'html-react-parser';
import DiscreteTimeSlider from './DiscreteTimeSlider';
import { Typography } from '@material-ui/core';
const namedurls = require("named-urls")

const sanitizeHtml = require('sanitize-html');

export function SubscriptionViewPage(props: any) {
    let user = RandomBackend.getCurrentUser();
    let subid = props.match.params.subid;
    const [sub, setSub] = React.useState<WatchSubscription | undefined>(undefined);
    const [runRecords, setRunRecords] = React.useState<DataRecord[] | undefined>(undefined);

    const [selectDataUrl, setSelectedDataUrl] = React.useState<string | undefined>(undefined);
    console.log(subid);
    React.useEffect(() => {
        user.findSubscription(subid).then(data => {
            let mysub = data as WatchSubscription;
            RandomDataTable.findTableRecords(
                mysub.storageTableID(user)
            ).then((records: DataRecord[]) => {
                setSub(mysub);
                setRunRecords(records);
                if (records.length > 0) {
                    records.slice(-1)[0].fetchData().then(data => {
                        setSelectedDataUrl(data);
                    });
                }
            });
        });
    }, [subid]);
    if (!sub || !runRecords) return null;
    return <div>
        <h4>
            <Link to={Routes.subscriptionlist}> Back </Link>
            <Link to={namedurls.reverse(Routes.subscriptionEdit, {
                subid: subid,
            })}> Edit </Link>
        </h4>
        <h3>
            {sub.url}
        </h3>
        <DiscreteTimeSlider
            items={runRecords.map(r => {
                return {
                    timestamp: r.timestamp * 1000, // to get to unix timestamp
                    item: r
                };
            })}
            callback={
                (item): void => {
                    console.log(item);
                    let record = item.item as DataRecord;
                    record.fetchData().then(data => {
                        setSelectedDataUrl(data);
                    });
                }
            }
        />
        {runRecords && runRecords.length === 0 &&
            <Typography variant="body1">
                We haven't had one successful run yet.
        </Typography>
        }


        {selectDataUrl && parse(
            sanitizeHtml(
                selectDataUrl as string,
                {
                    disallowedTagsMode: 'discard',
                    disallowedTags: ["script", "noscript"],
                }
            ))}
    </div>
}

