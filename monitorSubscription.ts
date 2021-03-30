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
            try {
                console.log(sub);

                const s = new Subscription(
                    sub.id,
                    sub.url,
                    [user.displayName],
                    {
                        storageTableName: `${user.id}-WatchSubscription-${sub.id}`,
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
