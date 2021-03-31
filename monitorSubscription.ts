import { getLastRecord } from "./website/src/CloudDB";
import { getRepository } from "fireorm";
import { AuthUser } from "./website/src/AuthUser";
import { Subscription, processSubscription } from "./Ingest";

async function doit(): Promise<any> {
    let users = await getRepository(AuthUser).find();
    for (const user of users) {
        console.log(user);
        let subs = await user.subscriptions.find();
        for (const sub of subs) {
            console.log(sub);
            if (sub.paused) {
                console.log("skipping because subscription is paused");
                continue;
            }
            try {
                let emails = sub.skipNotification ? [] : [user.email];

                const s = new Subscription(
                    sub.id,
                    sub.url,
                    emails,
                    {
                        storageTableName: sub.storageTableID(user),
                    });
                await processSubscription(s);
            } catch (err) {
                /*
                if (!s.ignoreErrors) {
                    errors.push({
                        name: sub.displayName,
                        error: err.toString(),
                    })
                }
                */
                console.log(err);
                console.log("Error but soldier on....");
            }
        }
    }
    console.log("hello")
    getLastRecord("a");
}

doit().then(
    () => {
        console.log("done?");
        process.exit();
    });
// doit();
