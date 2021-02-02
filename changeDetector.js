const urlparse = require('url');
const superagent = require('superagent');
const cheerio = require('cheerio');
const moment = require('moment');
const nodemailer = require('nodemailer');
const equal = require('deep-equal');

const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// 
// descriptors for subscriptions
// 
const Subscriptions = [
    {
        name: "NYS Covid Watcher",
        watchURL: "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers",
        contentType: "json",
        storageTableName: "NYS-COVID-2", // default should be the URL
        emails: ["xhuang@gmail.com"],
        changeDetected: (current, last) => {
            return !equal(last, current); // deep object 
        },
        interestDetector: (current, last) => {
            return true;
        },
        notificationContent: (current, last) => {
            // ufei bias list
            let goodlist = current.providerList.filter((site) =>
                (site.address == 'New York, NY'
                    || site.address == 'Wantagh, NY'
                    || site.address == "White Plains, NY")
            );

            return pretty(goodlist);
        }
    }
];

// system function 

async function saveInfoAtSystem(tablename, content) {
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

async function getLastRecord(tablename) {
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

async function scrape(url) {
    let body = await superagent.get(url)
        .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36')
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

const sendEmail = (emails, subject, html) => {
    const mailOptions = {
        from: 'Yum Yum <yumyumlifemailer@gmail.com>',
        to: emails.join(","),
        subject: subject,
        html: html
    };
    console.log("email attempted");
    transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
            console.log("Mail Error" + erro.toString());
            return
        }
        console.log("Mail sent to " + email + " subject:" + subject);
    });
};

function pretty(jsonobj) {
    let str = JSON.stringify(jsonobj, null, 2);
    return "<pre>" + str + "</pre>";
}

async function processSubscription(sub) {
    let content = await scrape(sub.watchURL);
    if (sub.contentType == "json") {
        content = JSON.parse(content);
    }
    let tablename = sub.storageTableName;
    let last = await getLastRecord(tablename);
    if (sub.changeDetected(content, last)) {
        await saveInfoAtSystem(tablename, content);
        if (sub.interestDetector(content, last)) {
            sendEmail(sub.emails, sub.name + ": interesting change detected", sub.notificationContent(content, last));
        } else {
            sendEmail(sub.emails, sub.name + ": change detected but not interesting", sub.notificationContent(content, last));
        }
    } else {
        console.log("change not detected - no action");
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
