'use strict';

var argv = require('minimist')(process.argv.slice(2));

function usage() {
    // Example Usage:
    //
    // node BigQuery.js -q 'select * from `my_dataset.CDC-county-test-latest` limit 5'
    //
    console.log(`Usage:   program -q query`);
    console.log(`         program -t view_or_table_name`);
}

function doQuery(query: string) {
    const { BigQuery } = require('@google-cloud/bigquery');
    async function performQuery() {
        const bigqueryClient = new BigQuery();
        // const sqlQuery = `select * from \`my_dataset.CDC-county-test-latest\` limit 5 `;
        const sqlQuery = query;
        const options = {
            query: sqlQuery,
            location: 'US',
        };
        // Run the query
        const [rows] = await bigqueryClient.query(options);
        console.log(JSON.stringify(rows, null, 2));
    }
    performQuery();
}

function main() {
    if (argv["q"]) {
        doQuery(argv["q"]);
    } else if (argv["t"]) {
        let query = `select * from \`${argv["t"]}\``;
        doQuery(query);
    } else {
        usage();
    }
}

main();
