import * as StorageType from "@firebase/storage-types";
import * as moment from 'moment';

global.XMLHttpRequest = require("xhr2"); // req'd for getting around firebase bug in nodejs.

require("@firebase/firestore");
require("@firebase/storage");
const firebase = require("firebase");
const cryptojs = require("crypto-js");
const superagent = require('superagent');

const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

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
    dataUrl: string;
    dataMd5: string;

    constructor(key: string, contentMd5: string, unixtimestamp: number, dataurl: string) {
        this.key = key;
        this.timestamp = unixtimestamp;
        this.timestampReadable = moment.unix(this.timestamp).toString();
        this.dataUrl = dataurl;
        this.dataMd5 = contentMd5;
    }

    static factory(obj: any) {
        return new DataRecord(
            obj.key,
            obj.dataMd5,
            obj.timestamp,
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

function snapshotToArrayData(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(childSnapshot.data());
    });
    return result;
}

function snapshotToArrayDataRecord(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(DataRecord.factory(childSnapshot.data()));
    });
    return result;
}


const StorageRootDirectory = "WatchStorage";

async function storeStringAsBlob(tablename: string, dockey: string, content: string): Promise<string> {
    var ref = getStorageRef().child(`${StorageRootDirectory}/${tablename}/${dockey}.txt`);
    // Raw string is the default if no format is provided
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

    timestamp = timestamp ? timestamp : moment().unix();
    let obj = new DataRecord(
        docRef.id,
        cryptojs.MD5(content).toString(),
        timestamp,
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

export async function getJobStatusTable(jobDescriptionID: string): Promise<string[]> {
    var docRef = db.collection("JobStatus").doc(jobDescriptionID);
    return await docRef.get().then(
        function (doc) {
            return doc.data() || {};
        });
}
export async function saveJobStatusTable(tablename: string, jobstatus: object) {
    let docRef = db.collection("JobStatus").doc(tablename);
    await docRef.set(jobstatus).then((doc) => {

    }).catch(err => {
        return null;
    });
    return true;
}

/*
export async function fetchUnfinishedJobs(tablename: string,
    skips: string[],
    njobs: number = 3): Promise<DataRecord[]> {
    var docRef = db.collection(tablename)
        .orderBy("timestamp", "asc")
        .where("key", "not-in", skips)
        .limit(njobs);
    return await docRef.get().then(
        function (querySnapshot) {
            return snapshotToArrayDataRecord(querySnapshot);
        });
}
*/