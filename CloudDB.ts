import * as StorageType from "@firebase/storage-types";
import * as moment from 'moment';
import * as fireorm from 'fireorm';
import { Collection, getRepository } from 'fireorm';
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
    key: string;
    timestamp: number;
    timestampReadable: string;
    dataBucket: string;
    dataPath: string;
    dataUrl: string;

    constructor(key: string, unixtimestamp: number, dataBucket: string, dataPath: string, dataurl: string) {
        this.key = key;
        this.timestamp = unixtimestamp;
        this.timestampReadable = moment.unix(this.timestamp).toString();
        this.dataUrl = dataurl;
        this.dataBucket = dataBucket;
        this.dataPath = dataPath;
    }

    static factory(obj: any) {
        return new DataRecord(
            obj.key,
            obj.timestamp,
            obj.dataBucket,
            obj.dataPath,
            obj.dataUrl,
        )
    }

    async fetchData(): Promise<string> {
        return await fetch(this.dataUrl);
    }

    toSimpleObject() {
        return Object.assign({}, this);
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

function storageFileName(tablename: string, dockey: string) {
    return `${StorageRootDirectory}/${tablename}/${dockey}.txt`;
}

async function storeStringAsBlob(tablename: string, dockey: string, content: string): Promise<string> {
    var ref = getStorageRef().child(storageFileName(tablename, dockey));
    await ref.putString(content)
    return await ref.getDownloadURL();
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

    let url = await storeStringAsBlob(tablename, docRef.id, content);

    timestamp = timestamp ? timestamp : moment.now() / 1000; // convert from ms to seconds.
    let obj = new DataRecord(
        docRef.id,
        timestamp,
        firebaseConfig.storageBucket,
        storageFileName(tablename, docRef.id),
        url,
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