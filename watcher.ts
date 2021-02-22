const superagent = require('superagent');

import * as ContentDiffer from './ContentDiffer';
import * as Email from './Email';
import * as CloudDB from './CloudDB';
import * as cheerio from "cheerio"
var assert = require('assert');
const jq = require('node-jq');

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
    cssSelect(query) {
        assert(this.contentType === WebPageContentType.HTML);
        let dom = cheerio.load(this.contentRaw);
        let content = dom(this.cssSelect).html();
        return new WebPageContent(content);
    }
    async jqQuery(query): Promise<WebPageContent> {
        assert(this.contentType === WebPageContentType.JSON);
        return new Promise((resolve, reject) => {
            jq.run(
                query,
                this.contentRaw,
                { input: 'string' }
            ).then((x) => { resolve(new WebPageContent(x)); });
        });
    }
}

type SubscriptionOptions = {
    contentType?: string,
    customHeaders?: object,
    notifyEvenNothingNew?: boolean,
    storageTableName?: string,
    cssSelect?: string,
    jqQuery?: string,
    ignoreErrors?: false,
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
    jqQuery: string | null = null;
    ignoreErrors: boolean = false;

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
            if (options.jqQuery) this.jqQuery = options.jqQuery;
            if (options.ignoreErrors) this.ignoreErrors = options.ignoreErrors;
        }
    }

    setStoragePrefix(prefix: string) { this.storageTableName = prefix; }
    setCustomHeader(headers: object) { this.customHeaders = headers; }

    async fetchContent(): Promise<WebPageContent> {
        let content = await scrape(this.watchURL, this.customHeaders);
        if (content === null) {
            throw ("Scraped content is null")
        }
        let contentWeb = new WebPageContent(content);
        if (this.cssSelect) {
            contentWeb = contentWeb.cssSelect(this.cssSelect)
        }
        if (this.jqQuery) {
            contentWeb = await contentWeb.jqQuery(this.jqQuery)
        }
        return contentWeb;
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
        ["xhuang@gmail.com", "sandy_hou@yahoo.com"],
        {
            contentType: "json",
            jqQuery: ".providerList",
            storageTableName: "NYC-Vaccines",
        }
    ),
    /*
    new Subscription(
        "Stanford Hospital",
        "https://stanfordhealthcare.org/discover/covid-19-resource-center/patient-care/safety-health-vaccine-planning.html",
        ["xhuang@gmail.com"],
        {
            storageTableName: "Stanford-Vaccine",
        }
    ),
    */
    new Subscription(
        "LA Times Vaccine Info",
        "https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/",
        ["xhuang@gmail.com"],
        {
            storageTableName: "California-Vaccine 2"
        }
    ),
    /*
    new Subscription(
        "Alameda County Vaccine Hospital",
        "https://covid-19.acgov.org/vaccines",
        ["xhuang@gmail.com"],
        {
            customHeaders: {
                'user-agent': 'curl/7.64.1',
            },
            storageTableName: "Alameda-Vaccine 2"
        }
    ),
    */
    new Subscription(
        "CDC State Vaccination Data",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data",
        [],
        {
            storageTableName: "CDC State Vaccination Data"
        }
    ),
    new Subscription(
        "CDC National Vaccination Trends",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_trends_data",
        [],
        {
            storageTableName: "CDC National Vaccination Trends"
        }
    ),
    new Subscription(
        "CDC Vaccination Demographic",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_demographics_data",
        [],
        {
            storageTableName: "CDC Vaccination Demographic"
        }
    ),
];

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

        return html;
    }

    if (!content.equal(last)) {
        await sub.saveRecord(content);
        if (last.isNull()) {
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
    // subs = NewSubscriptions.slice(0, 1); // first item
    // subs = NewSubscriptions.slice(-1); // last item

    let errors = [];
    for (let i = 0; i < subs.length; i++) {
        let sub = subs[i];
        try {
            console.log(sub);
            await processSubscription(sub);
        } catch (err) {
            if (!sub.ignoreErrors) {
                errors.push({
                    name: sub.name,
                    error: err.toString(),
                })
            }
            console.log(err);
            console.log("Error but soldier on....");
        }

    }
    if (errors.length > 0) {
        await Email.send(
            ["xhuang@gmail.com"],
            `${errors.length} from latest run`,
            JSON.stringify(errors, null, 2)
        );
    }
    // await Email.send(["xhuang@gmail.com"], "test from github", "what about this?")
}

doit().then(() => process.exit());
