import { User, UserCredential } from '@firebase/auth-types';
import { AuthUser } from "./AuthUser";
import { Collection, getRepository } from 'fireorm';
import { firebase } from './DBInit';

class RandomBackendClass {
    currentUser: AuthUser | null = null;
    constructor() { }
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
                    if (firebaseUser) {
                        this.currentUser = firebaseUser;
                        f(this.currentUser);
                    } else {
                        let u = AuthUser.fromFirebaseUser(user);
                        getRepository(AuthUser).create(u).then(newuser => {
                            this.currentUser = newuser;
                            f(this.currentUser);
                        });
                    }
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
