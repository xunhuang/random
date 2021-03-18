const cheerio = require('cheerio');
import * as Email from './Email';
import * as CloudDB from './CloudDB';
import * as MRUtils from './MapReduceUtils';
const { BigQuery } = require('@google-cloud/bigquery');
const { Storage } = require('@google-cloud/storage');

type BigQueryJobsOption = {
    verbose?: false,
    jobTableName?: string;
    datasetId?: string;
}

class GCSToBigQueryJobs {
    name: string;
    srctablename: string;
    outputTable: string;
    jobTableName: string | null = null;
    options: BigQueryJobsOption | null = null;
    verbose: false;
    datasetId: string = 'my_dataset';

    constructor(
        name: string,
        srctablename: string,
        outputTable: string,
        options: BigQueryJobsOption | null = null
    ) {
        this.name = name;
        this.srctablename = srctablename;
        this.outputTable = outputTable;
        if (options) {
            for (const key in options) {
                this[key] = options[key];
            }
        }
        if (!this.jobTableName) {
            this.jobTableName = `GCSToBigQuery-${this.name}-${this.srctablename}-${this.outputTable}`;
        }
    }

    async execute() {
        let jobStatusTable = await MRUtils.fetchJobsStatus(this.jobTableName);
        let allJobs = await CloudDB.getFullRecords(this.srctablename);
        let records = jobStatusTable.computeUnfinishedJobs(allJobs);

        let dirty = false;
        for (const record of records) {
            console.log("working on:", record.key);
            jobStatusTable.data[record.key] = MRUtils.JobExecStatus.SUCCESS;
            {
                const bigquery = new BigQuery();
                const storage = new Storage();
                const metadata = {
                    sourceFormat: 'NEWLINE_DELIMITED_JSON',
                    autodetect: true,
                    location: 'US',
                };

                let storagepath = storage.bucket(record.dataBucket).file(record.dataPath);

                // Load data from a Google Cloud Storage file into the table
                const [job] = await bigquery
                    .dataset(this.datasetId)
                    .table(this.outputTable)
                    .load(storagepath, metadata);
                // .load(record.dataUrl, metadata);
                // load() waits for the job to finish
                console.log(`Job ${job.id} completed.`);

                // Check the job's status for errors
                const errors = job.status.errors;
                if (errors && errors.length > 0) {
                    throw errors;
                }
                dirty = true;
            }
        }
        if (dirty) {
            await MRUtils.saveJobsStatus(jobStatusTable);
        } else {
            console.log("nothing to update");
        }
    }
}

async function executeMappers(jobs: GCSToBigQueryJobs[]) {
    let errors = [];
    for (const job of jobs) {
        try {
            console.log(job);
            await job.execute();
        } catch (err) {
            console.log(err);
            console.log("Error but soldier on....");
        }
    }
    if (errors.length > 0) {
        await Email.send(
            ["xhuang@gmail.com"],
            `Mapper Execution: ${errors.length} from latest run`,
            JSON.stringify(errors, null, 2)
        );
    }
}

const BigQueryJobs = [
    new GCSToBigQueryJobs(
        "CDC Test County Data into Big Query",
        "CDC-County-Test-JSONL3",
        "CDC-County-Test-Time-Series1",
        {
            // jobTableName: "California-Vaccine-2-job",
        }
    ),
];

async function doit() {
    await executeMappers(BigQueryJobs);
}

doit().then(() => process.exit());