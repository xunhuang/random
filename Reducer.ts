const cheerio = require('cheerio');
import * as Email from './Email';
import * as MRUtils from './MapReduceUtils';
import * as CloudDB from './CloudDB';
import * as moment from "moment";

type ReducerFunction = (content: string | null, preresult: string) => string;
type ReducerPreprocessFunction = (content: string) => string;
type ReducerPostprocessFunction = (content: string) => string;
type ReducerIteratorProcessingFunction = (content: object) => object;

type ReducerOptions = {
    verbose?: false,
    jobTableName?: string;
    preProcessor?: ReducerPreprocessFunction;
    postProcessor?: ReducerPostprocessFunction;
    iteratorProcessor?: ReducerIteratorProcessingFunction;
}

class ReducerJob {
    name: string;
    srctablename: string;
    outputTable: string;
    jobTableName: string | null = null;
    options: ReducerOptions | null = null;
    verbose: false;
    process: ReducerFunction;
    preProcessor: ReducerPreprocessFunction | null = null;

    constructor(
        name: string,
        srctablename: string,
        outputTable: string,
        process: ReducerFunction,
        options: ReducerOptions | null = null
    ) {
        this.name = name;
        this.srctablename = srctablename;
        this.outputTable = outputTable;
        this.process = process;
        if (options) {
            if (options.verbose) this.verbose = options.verbose;
            if (options.jobTableName) this.jobTableName = options.jobTableName;
            if (options.preProcessor) this.preProcessor = options.preProcessor;
        }
        if (!this.jobTableName) {
            this.jobTableName = `${this.name}-${this.srctablename}-${this.outputTable}`;
        }
    }

    async execute() {
        let jobStatusTable = await MRUtils.fetchJobsStatus(this.jobTableName);
        let successIds = MRUtils.getSuccessfulJobs(jobStatusTable);
        let allJobs = await CloudDB.getFullRecords(this.srctablename);
        let records = MRUtils.computeUnfinishedJobs(allJobs, successIds);

        var initialresult = await CloudDB.getLastRecord(this.outputTable) as string;
        var previousresults = initialresult;
        var succesfulruns = [];
        for (const record of records) {
            console.log("working on:", record.key);
            try {
                let data = await record.fetchData();
                if (this.preProcessor) {
                    data = this.preProcessor(data);
                }
                previousresults = await this.process(data, previousresults);
                succesfulruns.push(record.key);
            } catch (error) {
                console.log("error on:", record.key);
                console.log(error);
            }
        }

        if (previousresults !== initialresult) {
            // persist the new results. 
            await CloudDB.saveInfoAtSystem(this.outputTable, previousresults);
        }

        if (succesfulruns.length > 0) {
            for (const job of succesfulruns) {
                jobStatusTable[job] = MRUtils.JobExecStatus.SUCCESS;
            }
            await CloudDB.saveJobStatusTable(this.jobTableName, jobStatusTable);
        }
        console.log("done with reducer")
    }
}

async function executeReducers(jobs: ReducerJob[]) {
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
            `Reducer Execution: ${errors.length} from latest run`,
            JSON.stringify(errors, null, 2)
        );
    }
}

const BuiltInReducers = {
    /* this assumes results to be a line, it pushes items onto the list and perform a (deep) dedeup */
    ArrayPushDedup: (content: string, preresult: string | null): string => {
        let result = preresult ? JSON.parse(preresult) : [];
        let input = JSON.parse(content);
        for (const entry of input) {
            result.push(entry);
        }
        // console.log(`len is ${result.length} post pre-deup`)
        result = MRUtils.list_deep_dedup(result);
        // console.log(`len is ${result.length} post de-deup`)
        return JSON.stringify(result);
    },
}

function groupMaxTimeDedup(list: object[], groupby: string, timefield: string): object[] {
    let objects = {};
    for (const line of list) {
        let date = line[groupby];
        let fielddata = objects[date] || [];
        fielddata.push(line);
        objects[date] = fielddata;
    }

    function unixtime(o) {
        return moment.utc(o[timefield]).unix();
    }

    for (const key in objects) {
        if (objects.hasOwnProperty(key)) {
            let entries = objects[key];
            const max = entries.reduce(function (prev, current) {
                return (unixtime(prev) > unixtime(current)) ? prev : current
            }) //returns object
            objects[key] = max;
        }
    }
    return Object.values(objects);
}

const ReducerJobs = [
    new ReducerJob(
        "CA Vaccine Reducer (aggregate JSON table over time)",
        "California-Vaccine-Json-table",
        "Calfiornia-Vaccine-Overtime-Table",
        BuiltInReducers.ArrayPushDedup,
        {
            iteratorProcessor: (content: object): object => {
                delete content["url"];
                return content;
            },
            postProcessor: (content: string): string => {
                let input = JSON.parse(content);
                let result = groupMaxTimeDedup(input, "date", "updated_time");
                return JSON.stringify(result);
            },
        },
    ),
    new ReducerJob(
        "CDC State Vaccine Reducer (aggregate JSON table over time)",
        "CDC State Vaccination Data",
        "CDC-Vaccine-Overtime-Table",
        BuiltInReducers.ArrayPushDedup,
        {
            preProcessor: (content: string): string => {
                let input = JSON.parse(content);
                let result = input.vaccination_data;
                return JSON.stringify(result);
            }
        }
    ),
];

async function doit() {
    await executeReducers(ReducerJobs);
}

doit().then(() => process.exit());
