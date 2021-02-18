import * as CloudDB from './CloudDB';

export const JobExecStatus = {
    UNKNOWN: "pending",
    SUCCESS: "success",
    FAIL: "failed",
}

export function computeUnfinishedJobs(
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

export function getSuccessfulJobs(jobStatusTable: object): string[] {
    let successIds = [];
    for (const key in jobStatusTable) {
        if (jobStatusTable[key] === JobExecStatus.SUCCESS) {
            successIds.push(key);
        }
    }
    return successIds;
}

export async function fetchJobsStatus(tablename: string): Promise<string[]> {
    return await CloudDB.getJobStatusTable(tablename);
}

export function list_deep_dedup(list) {
    return list.reduce((r, i) =>
        !r.some(j => !Object.keys(i).some(k => i[k] !== j[k])) ? [...r, i] : r
        , [])
}