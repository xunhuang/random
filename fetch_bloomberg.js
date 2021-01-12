const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

async function saveHtmlInBloombergDB(html5) {
  let docRef = db.collection("Bloomberg").doc();
  let obj = {
    key: docRef.id,
    timestamp: moment().unix(),
    data: html5,
  }
  console.log(obj);
  await docRef.set(obj).then((doc) => {
    console.log(`done adding new state ${obj}`);
  }).catch(err => {
    console.log(err);
    return null;
  });
  return obj;
}


async function dumpBloomberInDb() {
  var exist = await db.collection("Bloomberg")
    .get().then((querySnapshot) => {
      venues = snapshotToArray(querySnapshot);
      console.log(venues);
      return;
    });
}



const moment = require("moment");

const superagent = require('superagent');
const fs = require('fs');
const cheerio = require('cheerio');

async function superAgentFetchSource(url) {
  return await
    superagent.get(url)
      .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36')
      .set('authority', 'www.bloomberg.com')
      .set('cache-control', 'max-age=0')
      .set('sec-ch-ua', '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"')
      .set('sec-ch-ua-mobile', '?0')
      .set('upgrade-insecure-requests', '1')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
      .set('sec-fetch-site', 'none')
      .set('sec-fetch-mode', 'navigate')
      .set('sec-fetch-user', '?1')
      .set('sec-fetch-dest', 'document')
      .then((res) => {
        const html = res.text;
        const $ = cheerio.load(html);
        let data = $("#dvz-data-cave");
        return data.html();;
      })
      .catch(err => {
        if (err) {
          console.log("err" + err);
        }
        return null;
      });
};

async function doit() {
  //let datastr = await superAgentFetchSource("https://www.bloomberg.com/graphics/covid-vaccine-tracker-global-distribution/");
  //data = JSON.parse(datastr);
  //console.log(JSON.stringify(data, null, 2));
  // await dumpBloomberInDb();
  await saveHtmlInBloombergDB("hello!");
}

doit();
