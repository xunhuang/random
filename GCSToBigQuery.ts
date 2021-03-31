const cheerio = require('cheerio');
import * as Email from './website/src/Email';
import { RandomDataTable } from "./website/src/RandomDataTable";
import * as MRUtils from './MapReduceUtils';
const { BigQuery } = require('@google-cloud/bigquery');
const { Storage } = require('@google-cloud/storage');
const moment = require("moment");

type BigQueryJobsOption = {
    verbose?: false,
    jobTableName?: string;
    datasetId?: string;
    overwriteTable?: boolean;
    startTime?: number; // ignore eariler records
}

class GCSToBigQueryJobs {
    name: string;
    srctablename: string;
    outputTable: string;
    jobTableName: string | null = null;
    options: BigQueryJobsOption | null = null;
    verbose: false;
    datasetId: string = 'my_dataset';
    overwriteTable: boolean = false;
    startTime: number = 0; // ignore eariler records



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
            this.jobTableName = `GCSToBigQuery-${this.srctablename}-${this.outputTable}`;
        }
    }

    async execute() {
        let jobStatusTable = await MRUtils.fetchJobsStatus(this.jobTableName);
        let allJobs = await RandomDataTable.findTableRecords(this.srctablename, this.startTime);
        let records = jobStatusTable.computeUnfinishedJobs(allJobs);
        console.log(`${records.length} records to process`)
        for (const record of records) {
            console.log("working on:", record.id);
            console.log(record.timestampReadable);
            const bigquery = new BigQuery();
            const storage = new Storage();
            const metadata = {
                sourceFormat: 'NEWLINE_DELIMITED_JSON',
                writeDisposition: 'WRITE_APPEND',
                schemaUpdateOptions: ['ALLOW_FIELD_ADDITION'],
                autodetect: true,
                location: 'US',
            };
            if (this.overwriteTable) {
                metadata.writeDisposition = 'WRITE_TRUNCATE';
                metadata.schemaUpdateOptions = null;
            }

            if (!record.isValid()) {
                console.log("Skipping invalid record...");
                console.log(record);
                continue;
            }
            let storagepath = storage.bucket(record.dataBucket).file(record.dataPath);

            const [job] = await bigquery
                .dataset(this.datasetId)
                .table(this.outputTable)
                .load(storagepath, metadata);
            console.log(`Job ${job.id} completed.`);

            const errors = job.status.errors;
            if (errors && errors.length > 0) {
                throw errors;
            }
            jobStatusTable.data[record.id] = MRUtils.JobExecStatus.SUCCESS;
            await MRUtils.saveJobsStatus(jobStatusTable);
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
        "CDC Test County Data(XFER)",
        "CDC-County-Test-JSONL3",
        "CDC-County-Test-Time-Series-new",
        /* after getting stuck on 3/18/21, run the follow the change the schema
 bq --location=US query --replace \
--destination_table myrandomwatch-b4b41:my_dataset.CDC-County-Test-Time-Series-new \
--use_legacy_sql=false 'SELECT DATE(report_date) as report_date, DATE(case_death_end_date) as case_death_end_date, DATE(testing_start_date) as testing_start_date, DATE(testing_end_date) as testing_end_date, DATE(case_death_start_date) as case_death_start_date, * except ( case_death_end_date, testing_start_date, testing_end_date, report_date, case_death_start_date )  FROM `myrandomwatch-b4b41.my_dataset.CDC-County-Test-Time-Series-new`'
 */
        {
            startTime: 1616136506,
        }
    ),
    new GCSToBigQueryJobs(
        "CA County Data (XFER to BQ)",
        "Calfiornia-Vaccine-Overtime-Table-NLJSON",
        "Calfiornia-Vaccine-Overtime"
    ),
    new GCSToBigQueryJobs(
        "CDC Vaccine County Data (XFER TO BQ)",
        "CDC-Vaccine-Overtime-Table-NLJSON",
        "CDC-Vaccine-Overtime-Table"
    ),
    new GCSToBigQueryJobs(
        "Upload ESRI (test)",
        "JHU-ESRI-Realtime2-NLJSON",
        "JHU-ESRI-Realtime-test",
        {
            overwriteTable: true,
        }
    ),
];

async function doit() {
    await executeMappers(BigQueryJobs);
}

doit().then(() => process.exit());