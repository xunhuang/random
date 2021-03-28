import { User, UserCredential } from '@firebase/auth-types';
import { AuthUser } from "./AuthUser";
import { Collection, getRepository } from 'fireorm';
import * as fireorm from 'fireorm';
require("@firebase/firestore");
require("@firebase/auth");

const firebase = require('firebase/app').default;
const firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}
fireorm.initialize(firebase.firestore(), {
    validateModels: true
});

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
                getRepository(AuthUser).findById(user.uid).then(firebaseUser => {
                    this.currentUser = firebaseUser;
                    if (!firebaseUser) {
                        this.currentUser = AuthUser.fromFirebaseUser(user);
                        getRepository(AuthUser).create(this.currentUser);
                    }
                    f(this.currentUser);
                });
            } else {
                console.log("user loggout!")
                f(null);
            }
        });
    }
    getCurrentUserOrNull() {
        return this.currentUser;
    }
    getCurrentUser(): AuthUser {
        return this.currentUser as AuthUser;
    }
}

export const RandomBackend = new RandomBackendClass();
