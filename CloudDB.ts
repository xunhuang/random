import * as StorageType from "@firebase/storage-types";
import * as moment from 'moment';
import * as fireorm from 'fireorm';
import { IsEmail } from 'class-validator';

global.XMLHttpRequest = require("xhr2"); // req'd for getting around firebase bug in nodejs.

require("@firebase/firestore");
require("@firebase/storage");
const firebase = require("firebase");
const superagent = require('superagent');

const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

fireorm.initialize(db, {
    validateModels: true
});

export function getDB() {
    return db;
}

export function getStorageRef(): StorageType.Reference {
    return firebase.storage().ref();
}

export class DataRecord {
    id: string;
    timestamp: number;
    timestampReadable: string;
    dataBucket: string;
    dataPath: string;
    dataUrl: string;

    static factory(obj: any): DataRecord {
        let data = new DataRecord();
        data.timestamp = obj.timestamp;
        data.timestampReadable = moment.unix(obj.timestamp).toString();
        data.dataBucket = obj.dataBucket;
        data.dataPath = obj.dataPath;
        data.dataUrl = obj.dataUrl;
        return data;
    }

    async fetchData(): Promise<string> {
        return await fetch(this.dataUrl);
    }

    toSimpleObject() {
        return Object.assign({}, this);
    }

    isValid() {
        return this.dataUrl !== null && this.dataUrl !== undefined;
    }
};

function snapshotToArrayDataRecord(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(DataRecord.factory(childSnapshot.data()));
    });
    return result;
}

const StorageRootDirectory = "WatchStorage";

export function storageFileName(tablename: string, dockey: string) {
    return `${StorageRootDirectory}/${tablename}/${dockey}.txt`;
}

export async function storeStringAsBlob(tablename: string, dockey: string, content: string): Promise<[string, string, string]> {
    let path = storageFileName(tablename, dockey);
    var ref = getStorageRef().child(path);
    await ref.putString(content);
    let url = await ref.getDownloadURL();
    return [url, path, firebaseConfig.storageBucket];
}

// some application semantics 
export async function saveInfoAtSystem(
    tablename: string,
    content: string,
    timestamp: number = 0,
    key: string | null = null
) {
    let docRef = (key) ?
        db.collection(tablename).doc(key) :
        db.collection(tablename).doc();

    let [url, path, dataBucket] = await storeStringAsBlob(tablename, docRef.id, content);

    timestamp = timestamp ? timestamp : moment.now() / 1000; // convert from ms to seconds.
    let obj = DataRecord.factory(
        {
            key: docRef.id,
            timestamp: timestamp,
            dataBucket: dataBucket,
            dataPath: path,
            dataUrl: url,
        }
    );

    await docRef.set(obj.toSimpleObject());
    return obj;
}

async function fetch(url: string): Promise<string> {
    return await superagent.get(url)
        .buffer(true) // this is due to google url returns application/oct stream.
        .then(res => {
            return res.body.toString();
        });
}

export async function getLastRecord(tablename: string): Promise<string | object | null> {
    var docRef = db.collection(tablename).orderBy("timestamp", "desc").limit(1);
    var dataUrl = null;
    await docRef.get().then(
        function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                dataUrl = doc.data().dataUrl;
            });
        });

    return (dataUrl) ? await fetch(dataUrl) : null;
}

export async function getFirstRecord(tablename: string): Promise<string | object | null> {
    var docRef = db.collection(tablename).orderBy("timestamp", "asc").limit(1);
    var dataUrl = null;
    await docRef.get().then(
        function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                dataUrl = doc.data().dataUrl;
            });
        });
    return (dataUrl) ? await fetch(dataUrl) : null;
}

export async function getFullRecords(tablename: string): Promise<DataRecord[]> {
    var docRef = db.collection(tablename).orderBy("timestamp", "asc");
    return await docRef.get().then(
        function (querySnapshot) {
            return snapshotToArrayDataRecord(querySnapshot);
        });
}