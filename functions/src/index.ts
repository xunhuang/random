import * as functions from 'firebase-functions';
import * as superagent from 'superagent';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

async function trigger_github() {
    const url = 'https://api.github.com/repos/xunhuang/random/dispatches';
    const token = functions.config().github.token;
    return superagent.post(url)
        .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', "application/vnd.github.v3+json")
        .send(
            {
                "event_type": "my_event_type",
                "client_payload": {
                    "example_key": "blah,blah"
                }
            }
        )
        .then((res) => {
            return
        })
        .catch(err => {
            if (err) {
                console.log("err" + err);
            }
            return;
        });
}

export const helloWorld = functions.https.onRequest((request, response) => {
    trigger_github().then(() => {
        response.send("done triggering");
    })
});

export const fireStoreBloombergObserver = functions.firestore
    .document('Bloomberg/{docId}')
    .onWrite((change, context) => {
        console.log("change detected! triggering github");
        return trigger_github();
    });