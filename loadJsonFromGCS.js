
'use strict';

function main(datasetId = 'my_dataset', tableId = 'ESRI_imported_raw') {
    const { BigQuery } = require('@google-cloud/bigquery');

    // Instantiate clients
    const bigquery = new BigQuery();

    async function loadJSONFromGCS() {
        const metadata = {
            sourceFormat: 'NEWLINE_DELIMITED_JSON',
            writeDisposition: 'WRITE_TRUNCATE',
            autodetect: true,
            location: 'US',
            schema: {
                fields: [
                    { name: 'FIPS', type: 'STRING' },
                    { name: 'Last_Update', type: 'INTEGER' },
                    { name: 'Confirmed', type: 'INTEGER' },
                    { name: 'Deaths', type: 'INTEGER' },
                    { name: 'Combined_Key', type: 'STRING' },
                    { name: 'Province_State', type: 'STRING' },
                    { name: 'Admin2', type: 'STRING' },
                    { name: 'Country_Region', type: 'STRING' },
                ],
            },
        };

        let file = "covidlatest-nl.json"

        // Load data from a Google Cloud Storage file into the table
        const [job] = await bigquery
            .dataset(datasetId)
            .table(tableId)
            .load(file, metadata);
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

main(...process.argv.slice(2));
