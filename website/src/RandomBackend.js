import { AuthUser } from "./AuthUser";
import { getRepository } from 'fireorm';
import * as fireorm from 'fireorm';
require("@firebase/firestore");
require("@firebase/auth");
const firebase = require('firebase/app').default;
const firebaseConfig = require('./firebaseConfig.json');
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
fireorm.initialize(firebase.firestore(), {
    validateModels: true
});
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
                getRepository(AuthUser).findById(user.uid).then(firebaseUser => {
                    this.currentUser = firebaseUser;
                    if (!firebaseUser) {
                        this.currentUser = AuthUser.fromFirebaseUser(user);
                        getRepository(AuthUser).create(this.currentUser);
                    }
                    f(this.currentUser);
                });
            }
            else {
                console.log("user loggout!");
                f(null);
            }
        });
    }
    getCurrentUserOrNull() {
        return this.currentUser;
    }
    getCurrentUser() {
        return this.currentUser;
    }
}
export const RandomBackend = new RandomBackendClass();
