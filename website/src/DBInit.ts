import * as fireorm from 'fireorm';
const firebase = require("firebase");
export const firebaseConfig = require('../../.firebaseConfig.json');
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
fireorm.initialize(db, {
    validateModels: true
});