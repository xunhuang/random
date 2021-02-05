import * as moment from 'moment';
const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = require('./.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export function getDB() {
    return db;
}


export type DataRecord = {
    key: string,
    timestamp: number,
    data: string | object,
};

function snapshotToArrayData(snapshot) {
    var result = [];
    snapshot.forEach(function (childSnapshot) {
        result.push(childSnapshot.data());
    });
    return result;
}

// some application semantics 
export async function saveInfoAtSystem(tablename: string, content: string, timestamp: number = 0) {
    let docRef = db.collection(tablename).doc();
    timestamp = timestamp ? timestamp : moment().unix();
    let obj = {
        key: docRef.id,
        timestamp: timestamp,
        timestampReadable: moment.unix(timestamp).toString(),
        data: content,
    } as DataRecord;
    await docRef.set(obj).then((doc) => {
    }).catch(err => {
        return null;
    });
    return obj;
}

export async function getLastRecord(tablename: string): Promise<string | object | null> {
    var docRef = db.collection(tablename).orderBy("timestamp", "desc").limit(1);
    var last = null;
    await docRef.get().then(
        function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                last = doc.data().data;
            });
        });
    return last;
}

export async function getFirstRecord(tablename: string): Promise<string | object | null> {
    var docRef = db.collection(tablename).orderBy("timestamp", "asc").limit(1);
    var first = null;
    await docRef.get().then(
        function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                first = doc.data().data;
            });
        });
    return first;
}

export async function getFullRecords(tablename: string): Promise<DataRecord[]> {
    var docRef = db.collection(tablename).orderBy("timestamp", "asc");
    return await docRef.get().then(
        function (querySnapshot) {
            return snapshotToArrayData(querySnapshot);
        });
}