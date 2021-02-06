const superagent = require('superagent');

import * as ContentDiffer from './ContentDiffer';
import * as Email from './Email';
import * as CloudDB from './CloudDB';
import * as cheerio from "cheerio"

enum WebPageContentType {
    UNKNOWN,
    NULL,
    HTML,
    JSON
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

class WebPageContent {
    contentRaw: string = "";
    contentType: WebPageContentType = WebPageContentType.UNKNOWN;
    contentJsonObject: object = null;

    constructor(content: string | object | null) {
        if (typeof content === "object") {
            this.contentType = WebPageContentType.JSON;
            this.contentRaw = JSON.stringify(content, null, 2);
            this.contentJsonObject = content;
        } else if (content === null) {
            this.contentType = WebPageContentType.NULL;
        } else {
            this.contentRaw = content;
            if (isJson(content)) {
                this.contentType = WebPageContentType.JSON;
                this.contentJsonObject = JSON.parse(content);
            } else {
                this.contentType = WebPageContentType.HTML;
            }
        }
    }

    equal(other: WebPageContent): boolean {
        if (this.contentType != other.contentType) {
            return false;
        }
        if (this.contentType === WebPageContentType.JSON) {
            return ContentDiffer.isContentTheSame(this.contentJsonObject, other.contentJsonObject);
        } else if (this.contentType === WebPageContentType.NULL) {
            return other.contentType === WebPageContentType.NULL;
        }
        return ContentDiffer.isContentTheSame(this.contentRaw, other.contentRaw);
    }

    diffContent(other: WebPageContent): string {
        if (this.contentType == WebPageContentType.HTML) {
            return ContentDiffer.diffHtmlPages(this.contentRaw, other.contentRaw);
        }
        if (this.contentType == WebPageContentType.JSON) {
            return ContentDiffer.diffJsonString(this.contentRaw, other.contentRaw);
        } if (this.contentType == WebPageContentType.NULL) {
            return other.contentRaw;
        }
        throw ("unknown content type");
    }
    toString() {
        if (this.contentType === WebPageContentType.JSON) {
            return JSON.stringify(JSON.parse(this.contentRaw), null, 2);
        }
        if (this.contentType === WebPageContentType.NULL) {
            return ""
        }
        return this.contentRaw;
    }
    isNull() {
        return this.contentType === WebPageContentType.NULL;
    }
}

type SubscriptionOptions = {
    contentType?: string,
    customHeaders?: object,
    notifyEvenNothingNew?: boolean,
    storageTableName?: string,
    cssSelect?: string,
}

class Subscription {
    name: string;
    watchURL: string;
    contentType: string = "text";
    storageTableName: string;
    emails: string[];
    customHeaders: object | null = null;
    notifyEvenNothingNew: boolean = false;
    cssSelect: string | null = null;

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
            if (options.cssSelect) this.cssSelect = options.cssSelect;
        }
    }

    setStoragePrefix(prefix: string) { this.storageTableName = prefix; }
    setCustomHeader(headers: object) { this.customHeaders = headers; }

    async fetchContent(): Promise<WebPageContent> {
        let content = await scrape(this.watchURL, this.customHeaders);
        if (this.cssSelect && typeof content == "string") {
            let dom = cheerio.load(content as string);
            content = dom(this.cssSelect).html();
        }
        return new WebPageContent(content);
    }

    async getLastRecord(): Promise<WebPageContent> {
        let last = await CloudDB.getLastRecord(this.storageTableName);
        return new WebPageContent(last);
    }
    async getFirstRecord(): Promise<WebPageContent> {
        let last = await CloudDB.getFirstRecord(this.storageTableName);
        return new WebPageContent(last);
    }
    async saveRecord(content: WebPageContent) {
        await CloudDB.saveInfoAtSystem(this.storageTableName, content.toString());
    }

    interestDetector(current: WebPageContent, last: WebPageContent | null) { return true; }
    notificationContent(current: WebPageContent, last: WebPageContent | null): string {
        if (current.contentType === WebPageContentType.JSON) {
            let c = JSON.stringify(current.contentJsonObject, null, 2);
            return `<pre>${c}</pre>`;
        }
        return current.toString();
    }
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
    // new Subscription(
    //     "Hacker News",
    //     "https://news.ycombinator.com",
    //     ["xhuang@gmail.com"],
    // ),
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
    ),
    new Subscription(
        "Bloomberg Vaccine Data",
        "https://www.bloomberg.com/graphics/covid-vaccine-tracker-global-distribution/",
        ["xhuang@gmail.com"],
        {
            customHeaders: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
                'authority': 'www.bloomberg.com',
                'cache-control': 'max-age=0',
                'sec-ch-ua': '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
                'sec-ch-ua-mobile': '?0',
                'upgrade-insecure-requests': '1',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'sec-fetch-site': 'none',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-user': '?1',
                'sec-fetch-dest': 'document'
            },
            cssSelect: "#dvz-data-cave", // extract data out
            storageTableName: "Bloomberg 2"
        }
    ),
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
              ${diff ? `<h4> Changes:  </h4>
                       <pre> ${diff} </pre> ` : ""
            }
            <h4>Website Current Content </h4>
            ${input}
            </body>
        </html>
            `;

        console.log(html);

        return html;
    }

    if (!content.equal(last)) {
        await sub.saveRecord(content);
        if (last.isNull) {
            await Email.send(sub.emails, sub.name + ": First run ",
                headers(sub.notificationContent(content, last), content, last)
            );
        } else if (sub.interestDetector(content, last)) {
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
    let subs = NewSubscriptions;
    // let subs = NewSubscriptions.slice(0, 1); // first item
    // subs = NewSubscriptions.slice(-1); // last item
    for (let i = 0; i < subs.length; i++) {
        try {
            let sub = subs[i];
            console.log(sub);
            await processSubscription(sub);
        } catch (err) {
            console.log(err);
            console.log("Error but soldier on....");
        }
    }
}

doit().then(() => process.exit());
