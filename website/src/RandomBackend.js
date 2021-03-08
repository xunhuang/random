import { AuthUser } from "./AuthUser";
require("@firebase/firestore");
require("@firebase/auth");
const firebase = require('firebase/app').default;
const firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
class RandomBackendClass {
    constructor() {
        this.currentUser = null;
    }
    ;
    login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log(result.user);
        }).catch(function (error) {
            console.log(error);
        });
    }
    logout() {
        this.currentUser = null;
        firebase.auth().signOut();
    }
    userStatusChange(f) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("newuser 2 !");
                this.currentUser = AuthUser.fromFirebaseUser(user);
            }
            else {
                console.log("user loggout!");
            }
            f(this.currentUser);
        });
    }
    getCurrentUser() {
        return this.currentUser;
    }
    getCurrentUserNotNull() {
        return this.currentUser;
    }
}
export const RandomBackend = new RandomBackendClass();
