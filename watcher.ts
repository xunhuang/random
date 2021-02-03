const urlparse = require('url');
const superagent = require('superagent');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const equal = require('deep-equal');
var HtmlDiffer = require('html-differ').HtmlDiffer;
var HtmlDiffLogger = require('html-differ/lib/logger');

var jsonDiff = require('json-diff')


import * as moment from 'moment';

const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// 
// descriptors for subscriptions
// 
// future attributes
// data retention
// pull  frequency
// differening -
// save the "last" item's id for comparison

const Subscriptions = [
    {
        name: "NYS Covid Watcher",
        watchURL: "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers",
        contentType: "json",
        storageTableName: "NYS-COVID-2", // default should be the URL
        emails: ["xhuang@gmail.com"],
        interestDetector: (current, last) => {
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );
            return goodlist.length > 0;
        },
        notificationContent: (current, last) => {
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );
            return pretty(goodlist);
        }
    },
    {
        name: "Stanford Hospital",
        watchURL: "https://stanfordhealthcare.org/discover/covid-19-resource-center/patient-care/safety-health-vaccine-planning.html",
        contentType: "text",
        storageTableName: "Stanford-Vaccine", // default should be the URL
        emails: ["xhuang@gmail.com"],
        interestDetector: (current, last) => {
            return true;
        },
        notificationContent: (current, last) => {
            return current;
        }
    },
    {
        name: "Alameda County Vaccine Hospital",
        watchURL: "https://covid-19.acgov.org/vaccines",
        customHeaders: {
            'user-agent': 'curl/7.64.1',
        },
        contentType: "text",
        storageTableName: "Alameda-Vaccine", // default should be the URL
        emails: ["xhuang@gmail.com"],
        // notifyEvenNothingNew: true,
        interestDetector: (current, last) => {
            return true;
        },
        notificationContent: (current, last) => {
            return current;
        }
    }
];

// system function 

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

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'yumyumlifemailer@gmail.com',
        pass: process.env.MAILER_PASSWORD
    }
});

const sendEmail = (emails, subject: string, html: string) => {
    const mailOptions = {
        from: 'Yum Yum <yumyumlifemailer@gmail.com>',
        to: emails.join(","),
        subject: subject,
        html: html
    };
    console.log("Mailng " + emails.join(",") + "with  subject:" + subject);
    transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
            console.log("Mail Error" + erro.toString());
            return;
        }
        console.log("Mail sent to " + emails + " subject:" + subject);
    });
};

function pretty(jsonobj: object) {
    let str = JSON.stringify(jsonobj, null, 2);
    return "<pre>" + str + "</pre>";
}


function html2text(html) {
    const stripped = cheerio.load(html).text()
        // .replace(/[ \t]+/g, ' ') // remove white spaces only, not line breaks
        // .replace(/(^[ \t]*\n)/gm, "") // remove empty lines
        .replace(/\s+/g, ' ') // remove white spaces and line breaks
        ;
    return stripped;
}

/* return null if two html pages are equal */
/* otherwise return a string that highlights the difference  */
function diffhtml(html1, html2) {
    var options = {
        ignoreAttributes: [],
        compareAttributesAsJSON: [],
        ignoreWhitespaces: true,
        ignoreComments: true,
        ignoreEndTags: false,
        ignoreDuplicateAttributes: false
    };
    var htmlDiffer = new HtmlDiffer(options);
    // var t1 = html2text(html1);
    // var t2 = html2text(html2);
    var t1 = html1;
    var t2 = html2;
    if (htmlDiffer.isEqual(t1, t2)) {
        return null;
    }
    var diff = htmlDiffer.diffHtml(t1, t2);
    var text = HtmlDiffLogger.getDiffText(diff, { charsAroundDiff: 40 });
    return text;
}

function isContentTheSame(c1, c2) {
    if (typeof c1 === "string" && typeof c2 === "string") {
        if (c1 === c2) {
            return true;
        }
        var options = {
            ignoreAttributes: [],
            compareAttributesAsJSON: [],
            ignoreWhitespaces: true,
            ignoreComments: true,
            ignoreEndTags: false,
            ignoreDuplicateAttributes: false
        };
        var htmlDiffer = new HtmlDiffer(options);
        if (htmlDiffer.isEqual(c1, c2)) {
            return true;
        }
        var t1 = html2text(c1);
        var t2 = html2text(c2);
        return htmlDiffer.isEqual(t1, t2);
    }

    // objects
    return equal(c1, c2);
}

async function processSubscription(sub) {
    let content = await scrape(sub.watchURL, sub.customHeaders);
    if (sub.contentType == "json") {
        content = JSON.parse(content);
    }
    let tablename = sub.storageTableName;
    let last = await getLastRecord(tablename);
    // let last = await getFirstRecord(tablename);

    function headers(input, content, last): string {
        var delta: string | undefined;
        if (content && last) {
            var diff: string | undefined;
            if (typeof content == "string") {
                diff = diffhtml(last, content);
            }
            if (typeof content == "object") {
                diff = jsonDiff.diffString(last, content);
            }
            if (diff) {
                console.log(diff);
                delta = `<h4> Changes:  </h4>
            <pre>
            ${diff}
            </pre>
            `;
            }
        }

        var html = `
        <html>
           <body>
              <h4> Watch URL: ${ sub.watchURL}</h4>
              ${delta ? delta : ""}
              <h4> Original Content</h4>
              ${input}
           </body>
        </html>
        `;

        return html;
    }

    if (!isContentTheSame(content, last)) {
        await saveInfoAtSystem(tablename, content);
        if (sub.interestDetector(content, last)) {
            sendEmail(sub.emails, sub.name + ": interesting change detected",
                headers(sub.notificationContent(content, last), content, last)
            );
        } else {
            sendEmail(sub.emails, sub.name + ": change detected but not interesting",
                headers(sub.notificationContent(content, last), content, last)
            );
        }
    } else {
        console.log("change not detected - no action");
        if (sub.notifyEvenNothingNew) {
            sendEmail(sub.emails, sub.name + ": nothing new (but you asked me to send this)",
                headers(sub.notificationContent(content, last), content, last)
            );
        }
    }
}

async function doit() {
    for (let i = 0; i < Subscriptions.length; i++) {
        try {
            let sub = Subscriptions[i];
            console.log(sub);
            await processSubscription(sub);
        } catch (err) {
            console.log(err);
            console.log("Error but soldier on....");
        }
    }
}

doit();
