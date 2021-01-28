const urlparse = require('url');
const superagent = require('superagent');
const cheerio = require('cheerio');
const moment = require('moment');
const nodemailer = require('nodemailer');

const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

async function saveInfoInFirebase(html5) {
  let docRef = db.collection("NYS-Covid").doc();
  let obj = {
    key: docRef.id,
    timestamp: moment().unix(),
    data: html5,
  }
  await docRef.set(obj).then((doc) => {
  }).catch(err => {
    return null;
  });
  return obj;
}

async function getLastRecord() {
    var docRef = db.collection("NYS-Covid").orderBy("timestamp", "desc").limit(1);

   var last ;
   await docRef.get().then(
       function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // console.log(doc.id, " => ", doc.data().data);
            last = doc.data().data;
        });
    });

    return last;

}

async function scrape(url) {
   let body = await superagent.get(url)
            .then(res => {
      return res.text;
   });
    return body;
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'yumyumlifemailer@gmail.com',
        pass: 'myyumyum'
    }
});

const sendEmail = (email, subject, html) => {
    const mailOptions = {
        from: 'Yum Yum <yumyumlifemailer@gmail.com>',
        to: email,
        subject: subject,
        html: html
    };

    return transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
            console.log("Mail Error" + erro.toString());
            return
        }
        console.log("Mail sent to " + email + " subject:" + subject);
    });
};

async function doit() {
     // src url ("https://am-i-eligible.covid19vaccine.health.ny.gov/");
     let txt  = await scrape("https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers");
    let json = JSON.parse(txt);


    let last = await getLastRecord();
    if (last.lastUpdated !== json.lastUpdated) {
        await saveInfoInFirebase(json);

        let goodlist = json.providerList.filter( (site) => 
            site.availableAppointments != "NAC" && 
            (  site.address == 'New York, NY'  
                || site.address == 'Wantagh, NY'  
                || site.address == "White Plains, NY")
        );  
        if ( goodlist.length > 0 ) {
            console.log(goodlist);
            sendEmail("xhuang@gmail.com", "NY covid status", JSON.stringify(goodlist));
        } else {
            console.log(json);
        console.log("Site updated but no appropriate site. Last updated: " + json.lastUpdated);
        }
    } else {
            console.log(json);
        console.log("No update from site. Last updated: " + last.lastUpdated);
    }
};

doit().then(()=> process.exit());

