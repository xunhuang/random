const cheerio = require('cheerio');
import * as Email from './Email';
import * as CloudDB from './CloudDB';

// ----------------------------------------------------------------
// vvvvvvvv
const JobExecStatus = {
    UNKNOWN: "pending",
    SUCCESS: "success",
    FAIL: "failed",
}

function computeUnfinishedJobs(
    allJobs: CloudDB.DataRecord[],
    successIds: string[],
): CloudDB.DataRecord[] {
    var successIdsMap = successIds.reduce(function (map, obj) {
        map[obj] = true;
        return map;
    }, {});

    let unfinished = [];
    for (const job of allJobs) {
        if (!successIdsMap[job.key]) {
            unfinished.push(job);
        }
    }
    return unfinished;
}

function getSuccessfulJobs(jobStatusTable: object): string[] {
    let successIds = [];
    for (const key in jobStatusTable) {
        if (jobStatusTable[key] === JobExecStatus.SUCCESS) {
            successIds.push(key);
        }
    }
    return successIds;
}

async function fetchJobsStatus(tablename: string): Promise<string[]> {
    return await CloudDB.getJobStatusTable(tablename);
}
// ^^^^^^^^^^^
// ----------------------------------------------------------------

type MapperOptions = {
    verbose?: false,
    jobTableName?: string;
}

type MapperFunction = (content: string | null, record: CloudDB.DataRecord) => string;

class MapperJob {
    name: string;
    srctablename: string;
    outputTable: string;
    jobTableName: string | null = null;
    options: MapperOptions | null = null;
    verbose: false;
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
            if (options.verbose) this.verbose = options.verbose;
            if (options.jobTableName) this.jobTableName = options.jobTableName;
        }
        if (!this.jobTableName) {
            this.jobTableName = `${this.name}-${this.srctablename}-${this.outputTable}`;
        }
    }

    async execute() {
        let jobStatusTable = await fetchJobsStatus(this.jobTableName);
        let successIds = getSuccessfulJobs(jobStatusTable);
        let allJobs = await CloudDB.getFullRecords(this.srctablename);
        let records = computeUnfinishedJobs(allJobs, successIds);

        let dirty = false;
        for (const record of records) {
            console.log("working on:", record.key);
            jobStatusTable[record.key] = JobExecStatus.SUCCESS;
            let data = await record.fetchData();
            let output = this.process(data, record);
            if (output) {
                await CloudDB.saveInfoAtSystem(this.outputTable,
                    output,
                    record.timestamp,
                    record.key
                );
                dirty = true;
            } else {
                // what to do if output is empty? marked as errors or what?
            }
        }
        if (dirty) {
            await CloudDB.saveJobStatusTable(this.jobTableName, jobStatusTable);
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
        "CA Vaccine Mapper",
        "California-Vaccine 2",
        "testoutput",
        (input: string, dataRecord: CloudDB.DataRecord) => {
            let dom = cheerio.load(input);
            let processed = dom("#counties-vaccination-data").html();
            return processed;
        },
        {
            jobTableName: "California-Vaccine-2-job",
        }
    )];
async function doit() {
    await executeMappers(MapperJobs);
}


doit()
