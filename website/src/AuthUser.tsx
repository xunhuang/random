import { User } from '@firebase/auth-types';
/* eslint-disable import/first */ // not sure why line position matters
import { Collection, getRepository } from 'fireorm';

@Collection()
export class AuthUser {
    id: string;
    displayName: string | null = null;

    static fromFirebaseUser(user: User) {
        let u = new AuthUser();
        u.displayName = user.displayName;
        u.id = user.uid;
        return u;
    }
    uid() { return this.id; }
}