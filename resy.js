const urlparse = require('url');
const superagent = require('superagent');
const cheerio = require('cheerio');
const moment = require('moment');

const venues = [ 
    { 
        businessid: 5785, 
        url_slug: "rich-table",
        resy_city_code:"sf",
    }, 
    { 
        businessid: 746, 
        url_slug: "ju-ni",
        resy_city_code:"sf",
    }, 
];

async function venueSearch(venue, date, party_size, timeOption) {
    // implement Resy here. 
}

async function doit() {
    for (let i = 0; i< venues.length ; i++ ) {
       let r = await venueSearch(venues[i], moment().format("YYYY-MM-DD"), 4, "dinner");
        console.log(r);
    }
};

doit();

