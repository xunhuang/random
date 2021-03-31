import * as fireorm from 'fireorm';

var f;
if (typeof window === 'undefined') {
    f = require("firebase");
} else {
    f = require('firebase/app').default;
}
require("@firebase/firestore");
require("@firebase/auth");
require("@firebase/storage");

export const firebaseConfig = require('../../.firebaseConfig.json');
f.initializeApp(firebaseConfig);
export const db = f.firestore();
fireorm.initialize(db, {
    validateModels: true
});

export const firebase = f;