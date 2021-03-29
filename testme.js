
const fs = require('fs');
const Mustache = require("mustache");

var view = {
    table_name: "`myrandomwatch-b4b41.my_dataset.California-Vaccination-Overtime-clean`",
    start_date: "2021-02-01",
    group_by_field: "fips",
    null_test_field: "doses_administered",
    date_field: "date",
};

view = {
    table_name: "`official.states-testing`",
    start_date: "2020-02-01",
    group_by_field: "state",
    null_test_field: "totalTestResults",
    date_field: "date",
};

var template = fs.readFileSync("backfill-template.sql").toString();

var output = Mustache.render(template, view);
console.log(output);