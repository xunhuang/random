import { User } from '@firebase/auth-types';

export class AuthUser {
    displayName: string | null;
    uid: string;

    constructor(user: User) {
        this.displayName = user.displayName;
        this.uid = user.uid;
    }
}