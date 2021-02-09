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

async function fetchSuccessfulJobs(tablename: string): Promise<string[]> {
    let jobStatusTable = await CloudDB.getJobStatusTable(tablename);

    let successIds = [];
    for (const key in jobStatusTable) {
        if (jobStatusTable[key] === JobExecStatus.SUCCESS) {
            successIds.push(key);
        }
    }
    return successIds;
}

async function fetchUnfinishedJobs(tablename: string, njobs: number = 3) {
    let successIds = await fetchSuccessfulJobs(tablename);
    return await CloudDB.fetchUnfinishedJobs(tablename, successIds, njobs);
}

async function doit() {
    const targetTable = "County-Vaccine-Data";
    let records = await fetchUnfinishedJobs("California-Vaccine");

    for (const record of records) {
        console.log("skipping work:", record.key);
        // console.log(record.timestamp);
        // let data = record.data;
        // let dom = cheerio.load(data);
        // let processed = dom("#counties-vaccination-data").html();
        // await CloudDB.saveInfoAtSystem(targetTable, processed, record.timestamp);
    }
    // await CloudDB.saveJobStatusTable("California-Vaccine", jobStatusTable);
}

/*
* The Job (from table to table)
*     From Table1 --> process ---> Table 2
*
*  1 time processing
*  recurrent processing
*  catch up processing (in case of error)
*
* table to remember whehther an entry has been successfully executed or not.
* trigger to process...

* Issues: 
  - need to remember which one has been run
  - Ordering may matter for the data...
  - framework should carry the timestamp...
*
*/


doit()
