const urlparse = require('url');
const superagent = require('superagent');
const cheerio = require('cheerio');
const moment = require('moment');

const venues = [ 
    { 
        url_slug: "sparrow",
    }, 
    { 
        url_slug: "nest1",
    }, 
    { 
        url_slug: "noblerot",
    }, 
];

async function venueSearch(venue, date, party_size, timeOption) {
    // implement residary here. 
}

async function doit() {
    for (let i = 0; i< venues.length ; i++ ) {
       let r = await venueSearch(venues[i], moment().format("YYYY-MM-DD"), 4, "dinner");
        console.log(r);
    }
};

doit();

