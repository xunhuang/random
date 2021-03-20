import * as moment from 'moment';
import { Collection, getRepository, ISubCollection, SubCollection } from 'fireorm';
import { DataRecord, storeStringAsBlob } from "./CloudDB";

export type RandomTableOptions = {
    displayName?: string;
    sourceOperation?: string;
    sourceTableName?: string;
    note?: string;
}

@Collection()
export class RandomDataTable {
    id: string;

    displayName: string | null = null;
    sourceOperation: string | null = null;
    sourceTableName: string | null = null;
    note: string | null = null;

    @SubCollection(DataRecord)
    dataRecords: ISubCollection<DataRecord>;

    async dataRecordAdd(content: string, timestamp: number | null = null) {
        let record = await this.dataRecords.create(new DataRecord());
        let [url, path, dataBucket] = await storeStringAsBlob(`RandomDataTables/${this.id}`, record.id, content);
        timestamp = timestamp || moment.now() / 1000; // convert from ms to seconds.
        record.timestamp = timestamp;
        record.timestampReadable = moment.unix(timestamp).toString();
        record.dataBucket = dataBucket
        record.dataPath = path;
        record.dataUrl = url;
        await this.dataRecords.update(record);
    }

    async lastDataRecord() {
        return await this.dataRecords.orderByDescending(item => item.timestamp).findOne();
    }

    setOptions(options: RandomTableOptions) {
        if (options) {
            for (const key in options) {
                this[key] = options[key];
            }
        }
    }

    static async findOrCreate(storageTableName: string, options: RandomTableOptions | null = null): Promise<RandomDataTable> {
        let storageTable = await getRepository(RandomDataTable).findById(storageTableName);
        if (!storageTable) {
            let newtable = new RandomDataTable();
            newtable.id = storageTableName;
            newtable.setOptions(options);
            storageTable = await getRepository(RandomDataTable).create(newtable);
        }
        return storageTable as RandomDataTable;
    }

    static async findTableRecords(storageTableName: string): Promise<DataRecord[]> {
        let storageTable = await getRepository(RandomDataTable).findById(storageTableName);
        if (!storageTable) {
            return [];
        }
        return await storageTable.dataRecords.orderByAscending(item => item.timestamp).find();
    }
}
