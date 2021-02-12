const cheerio = require('cheerio');

import * as CloudDB from './CloudDB';

async function doit2() {
    const targetTable = "County-Vaccine-Data";
    let record = await CloudDB.getLastRecord("California-Vaccine");
    let dom = cheerio.load(record);
    let data = dom("#counties-vaccination-data").html();
    console.log(data);

    await CloudDB.saveInfoAtSystem(targetTable, data);

    console.log("hello!");
    return;
}

interface Command {
    execute(input: string): string;
}

class CheerioCommand implements Command {
    execute(input: string): string {
        let dom = cheerio.load(input);
        let data = dom(this.cssSelector).html();
        return data
    }
    cssSelector: string;
    constructor(cssSelector: string) {
        this.cssSelector = cssSelector;
    }
}

class DataMovingJob {
    sourceTable: string;
    destTable: string;
    processing: Command[];
    constructor(source: string, dest: string, commands: Command[]) {
        this.sourceTable = source;
        this.destTable = dest;
        this.processing = commands;
    }
    execute(input: string): string {
        let start = input;
        let end = undefined;
        for (let i = 0; i < this.processing.length; i++) {
            let cmd = this.processing[i];
            end = cmd.execute(start);
            start = end;
        }
        return end;
    }
};

const Jobs = [
    new DataMovingJob(
        "California-Vaccine",
        "County-Vaccine-Data",
        [new CheerioCommand("#counties-vaccination-data")],
    )
]

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

async function doit() {
    const srctablename = "California-Vaccine 2";
    const jobTableName = "California-Vaccine-2-job";
    const outputTable = "testoutput";

    let jobStatusTable = await fetchJobsStatus(jobTableName);
    let successIds = getSuccessfulJobs(jobStatusTable);
    let allJobs = await CloudDB.getFullRecords(srctablename);
    let records = computeUnfinishedJobs(allJobs, successIds);

    async function process(input: string, dataRecord: CloudDB.DataRecord): Promise<string | null> {
        let dom = cheerio.load(input);
        let processed = dom("#counties-vaccination-data").html();
        return processed;
    }

    let dirty = false;
    for (const record of records) {
        console.log("working on:", record.key);
        jobStatusTable[record.key] = JobExecStatus.SUCCESS;
        let data = await record.fetchData();
        let output = await process(data, record);
        if (output) {
            await CloudDB.saveInfoAtSystem(outputTable,
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
        await CloudDB.saveJobStatusTable(jobTableName, jobStatusTable);
    } else {
        console.log("nothing to update");
    }
}

doit()
