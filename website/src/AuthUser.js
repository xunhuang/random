import React from 'react';
import { AuthUserContext } from "./AuthUserContext";
class AuthUser {
    constructor(user) {
        this.displayName = user.displayName;
        this.uid = user.uid;
    }
}
export function GetCurrentAuthUser() {
    let user = React.useContext(AuthUserContext);
    return new AuthUser(user);
}
