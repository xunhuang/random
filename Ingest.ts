import * as ContentDiffer from './website/src/ContentDiffer';
import * as Email from './website/src/Email';
import { RandomDataTable } from "./website/src/RandomDataTable";
import * as cheerio from "cheerio";
var assert = require('assert');
const jq = require('node-jq');
const superagent = require('superagent');

enum WebPageContentType {
    UNKNOWN,
    NULL,
    HTML,
    JSON
}
function isJson(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
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

export class WebPageContent {
    contentRaw: string = "";
    contentType: WebPageContentType = WebPageContentType.UNKNOWN;
    contentJsonObject: object = null;

    constructor(content: string | object | null = null) {
        if (content === null) {
            this.contentType = WebPageContentType.NULL;
        } else if (typeof content === "object") {
            this.contentType = WebPageContentType.JSON;
            this.contentRaw = JSON.stringify(content, null, 2);
            this.contentJsonObject = content;
        }
        else {
            this.contentRaw = content;
            if (isJson(content)) {
                this.contentType = WebPageContentType.JSON;
                this.contentJsonObject = JSON.parse(content);
            }
            else {
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
        }
        else if (this.contentType === WebPageContentType.NULL) {
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
            return "";
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
    contentType?: string;
    customHeaders?: object;
    notifyEvenNothingNew?: boolean;
    storageTableName?: string;
    cssSelect?: string;
    jqQuery?: string;
    ignoreErrors?: false;
};

export class Subscription {
    displayName: string;
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
        this.displayName = name;
        this.watchURL = watchURL;
        this.emails = emails;
        if (options) {
            for (const key in options) {
                this[key] = options[key];
            }
        }
        if (!this.storageTableName) {
            this.storageTableName = watchURL.replace(/\//g, "_");
        }
    }

    setStoragePrefix(prefix: string) { this.storageTableName = prefix; }
    setCustomHeader(headers: object) { this.customHeaders = headers; }


    async fetchContent(): Promise<WebPageContent> {
        let content = await scrape(this.watchURL, this.customHeaders);
        if (content === null) {
            throw ("Scraped content is null");
        }
        let contentWeb = new WebPageContent(content);
        if (this.cssSelect) {
            contentWeb = contentWeb.cssSelect(this.cssSelect);
        }
        if (this.jqQuery) {
            contentWeb = await contentWeb.jqQuery(this.jqQuery);
        }
        return contentWeb;
    }


    async getStorageTable(): Promise<RandomDataTable> {
        return await RandomDataTable.findOrCreate(this.storageTableName, {
            sourceOperation: "Ingest",
            displayName: this.displayName,
            sourceTableName: this.watchURL,
        });
    }


    async getLastRecord(): Promise<WebPageContent> {
        let storageTable = await this.getStorageTable();
        let record = await storageTable.lastDataRecord();
        if (!record) {
            return new WebPageContent();
        }
        return new WebPageContent(await record.fetchData());
    }


    async saveRecord(content: WebPageContent) {
        let storageTable = await this.getStorageTable();
        await storageTable.dataRecordAdd(content.toString());
    }

    interestDetector(current: WebPageContent, last: WebPageContent | null) { return true; }
    notificationContent(current: WebPageContent, last: WebPageContent | null): string {
        if (current.contentType === WebPageContentType.JSON) {
            let c = JSON.stringify(current.contentJsonObject, null, 2);
            return `<pre>${c}</pre>`;
        }
        return current.toString();
    }
}
;

export async function processSubscription(sub: Subscription) {

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
            await Email.send(sub.emails, sub.displayName + ": First run ",
                headers(sub.notificationContent(content, last), content, last)
            );
        } else if (sub.interestDetector(content, last)) {
            await Email.send(sub.emails, sub.displayName + ": interesting change detected",
                headers(sub.notificationContent(content, last), content, last)
            );
        } else {
            await Email.send(sub.emails, sub.displayName + ": change detected but not interesting",
                headers(sub.notificationContent(content, last), content, last)
            );
        }
    } else {
        console.log("change not detected - no action");
        if (sub.notifyEvenNothingNew) {
            await Email.send(sub.emails, sub.displayName + ": nothing new (but you asked me to send this)",
                headers(sub.notificationContent(content, last), content, last)
            );
        }
    }
}
