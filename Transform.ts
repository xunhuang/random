const cheerio = require('cheerio');
import * as Email from './Email';
import { RandomDataTable } from "./RandomDataTable";
import * as MRUtils from './MapReduceUtils';

export function serializeNdJson(data: unknown[]): string {
    const serializedList: string[] = [];
    for (let i = 0, len = data.length; i < len; i++) {
        serializedList.push(JSON.stringify(data[i]) + "\n");
    }
    return serializedList.join("");
}

type TransformerOptions = {
    verbose?: false,
    jobTableName?: string;
}

type TransformerFunction = (content: string | null) => string;

class TransformerJob {
    name: string;
    srctablename: string;
    outputTable: string;
    jobTableName: string | null = null;
    options: TransformerOptions | null = null;
    verbose: false;
    process: TransformerFunction;

    constructor(
        name: string,
        srctablename: string,
        outputTable: string,
        process: TransformerFunction,
        options: TransformerOptions | null = null
    ) {
        this.name = name;
        this.srctablename = srctablename;
        this.outputTable = outputTable;
        this.process = process;
        if (options) {
            if (options.verbose) this.verbose = options.verbose;
            if (options.jobTableName) this.jobTableName = options.jobTableName;
        }
        if (!this.jobTableName) {
            this.jobTableName = `TRANSFORM-${this.name}-${this.srctablename}-${this.outputTable}`;
        }
    }

    async getStorageTable(): Promise<RandomDataTable> {
        return await RandomDataTable.findOrCreate(this.outputTable, {
            sourceOperation: "Transform",
            displayName: this.name,
            sourceTableName: this.srctablename,
        });
    }

    async execute() {
        let jobStatusTable = await MRUtils.fetchJobsStatus(this.jobTableName);
        let allJobs = await RandomDataTable.findTableRecords(this.srctablename);
        let records = jobStatusTable.computeUnfinishedJobs(allJobs);

        let dirtyCount = 0;
        for (const record of records) {
            console.log("working on:", record.id);
            jobStatusTable.data[record.id] = MRUtils.JobExecStatus.SUCCESS;
            let data = await record.fetchData();
            let output = this.process(data);
            if (output) {
                let storage = await this.getStorageTable();
                // inheriting the original timestamp.
                await storage.dataRecordAdd(output, record.timestamp);
                dirtyCount++;
                if (dirtyCount === 5) {
                    await MRUtils.saveJobsStatus(jobStatusTable);
                    dirtyCount = 0;
                }
            }
        }
        if (dirtyCount) {
            await MRUtils.saveJobsStatus(jobStatusTable);
        } else {
            console.log("nothing to update");
        }
    }
}

async function executeTransformers(jobs: TransformerJob[]) {
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
            `Transformer Execution: ${errors.length} from latest run`,
            JSON.stringify(errors, null, 2)
        );
    }
}

const TransformerJobs = [
    new TransformerJob(
        "CA Vaccine Transformer (html to json)",
        "California-Vaccine-2",
        "California-Vaccine-Json-table",
        (input: string) => {
            let dom = cheerio.load(input);
            let processed = dom("#counties-vaccination-data").html();
            return processed;
        }
    ),
    new TransformerJob(
        "CDC County Test (JSONL)",
        "CDC-County-Data",
        "CDC-County-Test-JSONL3",
        (input: string) => {
            let dom = JSON.parse(input);
            let data = dom.integrated_county_latest_external_data;
            let output = serializeNdJson(data);
            return output;
        }
    ),
    new TransformerJob(
        "CA Vaccine (aggregate JSON table over time), this should go into BigQuery",
        "California-Vaccine-Json-table",
        "Calfiornia-Vaccine-Overtime-Table-NLJSON",
        (input: string) => {
            let dom = JSON.parse(input);
            let output = serializeNdJson(dom);
            return output;
        }
    ),

    new TransformerJob(
        "CDC State Vaccine (aggregate JSON table over time), this should go into BigQuery",
        "CDC-State-Vaccination-Data",
        "CDC-Vaccine-Overtime-Table-NLJSON",
        (input: string) => {
            let dom = JSON.parse(input);
            let output = serializeNdJson(dom.vaccination_data);
            return output;
        }
    ),
];

async function doit() {
    await executeTransformers(TransformerJobs);
}

doit().then(() => process.exit());