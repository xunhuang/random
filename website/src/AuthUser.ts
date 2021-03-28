import { User } from '@firebase/auth-types';
/* eslint-disable import/first */ // not sure why line position matters
import { Collection, getRepository, ISubCollection, SubCollection } from 'fireorm';

export class WatchSubscription {
    id: string;
    name: string;
    url: string;
    frequency: number;
};

@Collection("Blahblah")
export class AuthUser {
    id: string;
    displayName: string | null = null;

    @SubCollection(WatchSubscription, "More path")
    subscriptions: ISubCollection<WatchSubscription>;

    static fromFirebaseUser(user: User) {
        let u = new AuthUser();
        u.displayName = user.displayName;
        u.id = user.uid;
        // console.log("hello")
        return u;
    }
    uid() { return this.id; }

    subscriptionAdd(sub: WatchSubscription) {
        this.subscriptions.create(sub);
    }
}
