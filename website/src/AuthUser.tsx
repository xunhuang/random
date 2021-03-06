import React from 'react';
import { AuthUserContext } from "./AuthUserContext"
import { User } from '@firebase/auth-types';

class AuthUser {
    displayName: string | null;
    uid: string;

    constructor(user: User) {
        this.displayName = user.displayName;
        this.uid = user.uid;
    }
}

export function GetCurrentAuthUser() {
    let user = React.useContext(AuthUserContext);
    return new AuthUser(user as unknown as User);
}