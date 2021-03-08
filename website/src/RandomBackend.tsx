import { User, UserCredential } from '@firebase/auth-types';
import { AuthUser } from "./AuthUser";
require("@firebase/firestore");
require("@firebase/auth");

const firebase = require('firebase/app').default;
const firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

class RandomBackendClass {
    currentUser: AuthUser | null = null;;
    constructor() {

    }
    login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result: UserCredential) {
            console.log(result.user);
        }).catch(function (error: any) {
            console.log(error);
        });
    }
    logout() {
        this.currentUser = null;
        firebase.auth().signOut();
    }
    userStatusChange(f: (user: AuthUser | null) => void) {
        firebase.auth().onAuthStateChanged((user: User) => {
            if (user) {
                console.log("newuser 2 !")
                this.currentUser = AuthUser.fromFirebaseUser(user);
            } else {
                console.log("user loggout!")
            }
            f(this.currentUser);
        });
    }
    getCurrentUser() {
        return this.currentUser;
    }
    getCurrentUserNotNull(): AuthUser {
        return this.currentUser as AuthUser;
    }
}

export const RandomBackend = new RandomBackendClass(); 