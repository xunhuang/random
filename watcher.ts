const superagent = require('superagent');

import * as ContentDiffer from './ContentDiffer';
import * as Email from './Email';
import * as moment from 'moment';

const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

class WebPageContent {
    content: string | object;
    constructor(content: string | object) {
        this.content = content;
    }
    contentType(): string { return typeof this.content };

    equal(other: WebPageContent): boolean {
        return ContentDiffer.isContentTheSame(this.content, other.content);
    }

    diffContent(other: WebPageContent): string {
        if (typeof this.content == "string") {
            return ContentDiffer.diffHtmlPages(this.content, other.content as string);
        }
        if (typeof this.content == "object") {
            return ContentDiffer.diffJsonObjects(this.content, other.content as object);
        }
        throw ("unknown content type");
    }
    toString() {
        if (typeof this.content === "object") {
            return JSON.stringify(this.content, null, 2);
        }
        return this.content;
    }
}

type SubscriptionOptions = {
    contentType?: string,
    customHeaders?: object,
    notifyEvenNothingNew?: boolean,
    storageTableName?: string,
}

class Subscription {
    name: string;
    watchURL: string;
    contentType: string = "text";
    storageTableName: string;
    emails: string[];
    customHeaders: object | null = null;
    notifyEvenNothingNew: boolean = false;

    constructor(
        name: string,
        watchURL: string,
        emails: string[],
        options: SubscriptionOptions | null = null
    ) {
        this.name = name;
        this.watchURL = watchURL;
        this.storageTableName = watchURL.replace(/\//g, "_");
        this.emails = emails;
        if (options) {
            if (options.contentType) this.contentType = options.contentType;
            if (options.customHeaders) this.customHeaders = options.customHeaders;
            if (options.notifyEvenNothingNew) this.notifyEvenNothingNew = options.notifyEvenNothingNew;
            if (options.storageTableName) this.storageTableName = options.storageTableName;
        }
    }

    setStoragePrefix(prefix: string) { this.storageTableName = prefix; }
    setCustomHeader(headers: object) { this.customHeaders = headers; }

    async fetchContent(): Promise<WebPageContent> {
        let content = await scrape(this.watchURL, this.customHeaders);
        if (this.contentType == "json") {
            content = JSON.parse(content);
        }
        return new WebPageContent(content);
    }

    async getLastRecord(): Promise<WebPageContent> {
        let last = await getLastRecord(this.storageTableName);
        return new WebPageContent(last);
    }
    async saveRecord(content: WebPageContent) {
        await saveInfoAtSystem(this.storageTableName, content.toString());
    }

    interestDetector(current: WebPageContent, last: WebPageContent | null) { return true; }
    notificationContent(current: WebPageContent, last: WebPageContent | null): string { return current.content.toString(); }
};

const NewSubscriptions = [
    new Subscription(
        "NYS Covid Watcher",
        "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers",
        ["xhuang@gmail.com"],
        {
            contentType: "json",
        }
    ),
    new Subscription(
        "Stanford Hospital",
        "https://stanfordhealthcare.org/discover/covid-19-resource-center/patient-care/safety-health-vaccine-planning.html",
        ["xhuang@gmail.com"],
    ),
    new Subscription(
        "Hacker News",
        "https://news.ycombinator.com",
        ["xhuang@gmail.com"],
    ),
    new Subscription(
        "LA Times Vaccine Info",
        "https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/",
        ["xhuang@gmail.com"],
        {
            storageTableName: "California-Vaccine"
        }
    ),
    new Subscription(
        "Alameda County Vaccine Hospital",
        "https://covid-19.acgov.org/vaccines",
        ["xhuang@gmail.com"],
        {
            customHeaders: {
                'user-agent': 'curl/7.64.1',
            },
        }
    )
];


/*
        interestDetector: (current, last) => {
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );
            return goodlist.length > 0;
        },
        notificationContent: (current, last) => {
            function pretty(jsonobj: object) {
                let str = JSON.stringify(jsonobj, null, 2);
                return "<pre>" + str + "</pre>";
            }
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );
            return pretty(goodlist);
        }
        */

async function saveInfoAtSystem(tablename: string, content) {
    let docRef = db.collection(tablename).doc();
    let obj = {
        key: docRef.id,
        timestamp: moment().unix(),
        data: content,
    }
    await docRef.set(obj).then((doc) => {
    }).catch(err => {
        return null;
    });
    return obj;
}

async function getLastRecord(tablename: string) {
    var docRef = db.collection(tablename).orderBy("timestamp", "desc").limit(1);
    var last = null;
    await docRef.get().then(
        function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                last = doc.data().data;
            });
        });
    return last;
}

async function getFirstRecord(tablename: string) {
    var docRef = db.collection(tablename).orderBy("timestamp", "asc").limit(1);
    var first = null;
    await docRef.get().then(
        function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                first = doc.data().data;
            });
        });
    return first;
}

async function scrape(url, customHeaders) {
    let request = superagent.get(url)
        .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36')
        ;
    if (customHeaders) {
        for (let key in customHeaders)
            request.set(key, customHeaders[key]);
    }
    let body = await request
        .then(res => {
            return res.text;
        });
    return body;
}


async function processSubscription(sub: Subscription) {

    let content = await sub.fetchContent();
    let last = await sub.getLastRecord();

    function headers(input: string, content: WebPageContent, last: WebPageContent): string {
        var diff: string | undefined;
        if (content && last) {
            diff = last.diffContent(content);
        }

        var html = `
        <html>
           <body>
              <h4> Watch URL: ${ sub.watchURL}</h4>
              ${diff && `<h4> Changes:  </h4>
                       <pre> ${diff} </pre> `
            }
            <h4>Website Current Content </h4>
            ${input}
            </body>
        < /html>
            `;

        return html;
    }

    if (!content.equal(last)) {
        await sub.saveRecord(content);
        if (sub.interestDetector(content, last)) {
            await Email.send(sub.emails, sub.name + ": interesting change detected",
                headers(sub.notificationContent(content, last), content, last)
            );
        } else {
            await Email.send(sub.emails, sub.name + ": change detected but not interesting",
                headers(sub.notificationContent(content, last), content, last)
            );
        }
    } else {
        console.log("change not detected - no action");
        if (sub.notifyEvenNothingNew) {
            await Email.send(sub.emails, sub.name + ": nothing new (but you asked me to send this)",
                headers(sub.notificationContent(content, last), content, last)
            );
        }
    }
}

async function doit() {
    for (let i = 0; i < NewSubscriptions.length; i++) {
        try {
            let sub = NewSubscriptions[i];
            console.log(sub);
            await processSubscription(sub);
        } catch (err) {
            console.log(err);
            console.log("Error but soldier on....");
        }
    }
}

doit().then(() => process.exit());
