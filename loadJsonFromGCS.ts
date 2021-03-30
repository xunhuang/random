
'use strict';

const { METHODS } = require('http');

function main(
    datasetId = 'my_dataset',
    tableId = 'ESRI_imported_raw',
    filename = 'covidlatest-nl.json',
    schemafile = null
) {
    const { BigQuery } = require('@google-cloud/bigquery');

    // Instantiate clients
    const bigquery = new BigQuery();

    async function loadJSONFromGCS() {

        var fs = require('fs');

        const metadata = {
            sourceFormat: 'NEWLINE_DELIMITED_JSON',
            writeDisposition: 'WRITE_TRUNCATE',
            autodetect: true,
            location: 'US',
            schema: null,
        };

        if (schemafile) {
            var schema = JSON.parse(fs.readFileSync(schemafile, 'utf8'));
            metadata.schema = schema;
        }

        // Load data from a Google Cloud Storage file into the table
        const [job] = await bigquery
            .dataset(datasetId)
            .table(tableId)
            .load(filename, metadata);
        // load() waits for the job to finish
        console.log(`Job ${job.id} completed.`);

        // Check the job's status for errors
        const errors = job.status.errors;
        if (errors && errors.length > 0) {
            throw errors;
        }
    }
    loadJSONFromGCS();
}

console.log(process.argv.slice(2));
main(...process.argv.slice(2));
