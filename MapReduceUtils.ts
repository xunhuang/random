import * as CloudDB from './CloudDB';
import { Collection, getRepository } from 'fireorm';
import * as fireorm from 'fireorm';

export enum JobExecStatus {
    UNKNOWN = "pending",
    SUCCESS = "success",
    FAIL = "failed",
}

@Collection()
export class JobStatusTable {
    id: string;
    tableName: string;
    data: {
        [key: string]: JobExecStatus;
    }

    static fromTableName(tablename) {
        let newitem = new JobStatusTable();
        newitem.id = tablename;
        newitem.tableName = tablename;
        newitem.data = {};
        return newitem;
    }

    computeUnfinishedJobs(allJobs: CloudDB.DataRecord[],): CloudDB.DataRecord[] {
        let unfinished = [];
        for (const job of allJobs) {
            let status = this.data[job.id];
            if (!status || status != JobExecStatus.SUCCESS) {
                unfinished.push(job);
            }
        }
        return unfinished
    }

}
export async function fetchJobsStatus(tablename: string): Promise<JobStatusTable> {
    let repos = getRepository(JobStatusTable);
    let table = await repos.whereEqualTo(a => a.tableName, tablename).findOne();
    if (!table) {
        table = JobStatusTable.fromTableName(tablename);
        await repos.create(table);
    }
    return table;
}

export async function saveJobsStatus(job: JobStatusTable): Promise<void> {
    let repos = getRepository(JobStatusTable);
    await repos.update(job);
}

export function list_deep_dedup(list) {
    return list.reduce((r, i) =>
        !r.some(j => !Object.keys(i).some(k => i[k] !== j[k])) ? [...r, i] : r
        , [])
}