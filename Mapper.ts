const cheerio = require('cheerio');
import * as Email from './website/src/Email';
import * as CloudDB from './website/src/CloudDB';
import * as MRUtils from './MapReduceUtils';


export function serializeNdJson(data: unknown[]): string {
    const serializedList: string[] = [];
    for (let i = 0, len = data.length; i < len; i++) {
        serializedList.push(JSON.stringify(data[i]) + "\n");
    }
    return serializedList.join("");
}

type MapperOptions = {
    jobTableName?: string;
}

type MapperFunction = (content: string | null) => string;

class MapperJob {
    name: string;
    srctablename: string;
    outputTable: string;
    jobTableName: string | null = null;
    options: MapperOptions | null = null;
    process: MapperFunction;

    constructor(
        name: string,
        srctablename: string,
        outputTable: string,
        process: MapperFunction,
        options: MapperOptions | null = null
    ) {
        this.name = name;
        this.srctablename = srctablename;
        this.outputTable = outputTable;
        this.process = process;
        if (options) {
            if (options.jobTableName) this.jobTableName = options.jobTableName;
        }
        if (!this.jobTableName) {
            this.jobTableName = `${this.name}-${this.srctablename}-${this.outputTable}`;
        }
    }

    async execute() {
        let jobStatusTable = await MRUtils.fetchJobsStatus(this.jobTableName);
        let allJobs = await CloudDB.getFullRecords(this.srctablename);
        let records = jobStatusTable.computeUnfinishedJobs(allJobs);

        let dirty = false;
        for (const record of records) {
            console.log("working on:", record.id);
            jobStatusTable.data[record.id] = MRUtils.JobExecStatus.SUCCESS;
            let data = await record.fetchData();
            let output = this.process(data);
            if (output) {
                await CloudDB.saveInfoAtSystem(this.outputTable,
                    output,
                    record.timestamp,
                    record.id
                );
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

async function executeMappers(jobs: MapperJob[]) {
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

const MapperJobs = [
    new MapperJob(
        "CA Vaccine Mapper (html to json)",
        "California-Vaccine 2",
        "California-Vaccine-Json-table",
        (input: string) => {
            let dom = cheerio.load(input);
            let processed = dom("#counties-vaccination-data").html();
            return processed;
        },
        {
            // jobTableName: "California-Vaccine-2-job",
        }
    ),
    new MapperJob(
        "CDC County Test (JSONL)",
        "CDC County Data",
        "CDC-County-Test-JSONL3",
        (input: string) => {
            let dom = JSON.parse(input);
            let data = dom.integrated_county_latest_external_data;
            let output = serializeNdJson(data);
            return output;
        },
        {
        }
    ),
    // transitional mapper job to move src ingested table.
    new MapperJob(
        "CDC County Test (JSONL)",
        "CDC County Data",
        "RandomDataTables/CDC-County-Data/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-CDC-county-test"
        }
    ),
    // transitional mapper job to move src ingested table.
    new MapperJob(
        "CDC national vaccination trends",
        "CDC National Vaccination Trends",
        "RandomDataTables/CDC-National-Vaccination-Trends/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-CDC-national-vac-trends"
        }
    ),

    // transitional mapper job to move src ingested table.
    new MapperJob(
        "CDC State Testing Data",
        "CDC State Testing Data",
        "RandomDataTables/CDC-State-Testing-Data/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-CDC-State-Testing-Data"
        }
    ),

    // transitional mapper job to move src ingested table.
    new MapperJob(
        "CDC State Vaccination Data",
        "CDC State Vaccination Data",
        "RandomDataTables/CDC-State-Vaccination-Data/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-CDC-State-Vaccination-Data"
        }
    ),

    // transitional mapper job to move src ingested table.
    new MapperJob(
        "CDC Vaccination Demographic",
        "CDC Vaccination Demographic",
        "RandomDataTables/CDC-Vaccination-Demographic/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-CDC-Vaccination-Demographic"
        }
    ),

    // transitional mapper job to move src ingested table.
    new MapperJob(
        "California-Vaccine 2",
        "California-Vaccine 2",
        "RandomDataTables/California-Vaccine-2/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-California-Vaccine-2"
        }

    ),
    // transitional mapper job to move src ingested table.
    new MapperJob(
        "NYC-Vaccines",
        "NYC-Vaccines",
        "RandomDataTables/NYC-Vaccines-New/DataRecords",
        (input: string) => {
            return input;
        },
        {
            jobTableName: "transition-NYC-Vaccines-New"
        }
    ),
];

async function doit() {
    await executeMappers(MapperJobs);
}

doit().then(() => process.exit());