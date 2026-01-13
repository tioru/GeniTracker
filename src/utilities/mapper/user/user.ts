import { Injectable } from "@angular/core";
import { ProjectClass } from "../../classes/class";

@Injectable({
  providedIn: 'root'
})
export class UserMapper {
    constructor() {}

    public static mapRemoteDict(rUsers : { [key: string]: ProjectClass.Remote.User }) : { [key: string]: ProjectClass.Local.User } {
        const lUsers : { [key: string]: ProjectClass.Local.User } = {};

        const keys = Object.keys(rUsers);

        keys.forEach ((key) => {
            lUsers[key] = this.mapRemote(rUsers[key]);
        })
        
        return lUsers;
    }
    
    public static mapRemote(rUser : ProjectClass.Remote.User) : ProjectClass.Local.User {
        try  {
            return new ProjectClass.Local.User({
                displayName : !!rUser.displayName ? rUser.displayName : null,
                email : rUser.email,
                photoURL : !!rUser.photoURL ? rUser.photoURL : null,
                signUpDate : new Date(rUser.signUpDate!),
                lastLoginDate : new Date(rUser.lastLoginDate!),
                uid : rUser.uid
            })
        } catch (error) {
            throw new Error("Error mapping Remote User to Local User: " + error);
        }
    }
    
    public static mapLocalDict(lUsers : { [key: string]: ProjectClass.Local.User }) : { [key: string]: ProjectClass.Remote.User } {
        const rUsers : { [key: string]: ProjectClass.Remote.User } = {};

        const keys = Object.keys(lUsers);

        keys.forEach ((key) => {
            rUsers[key] = this.mapLocal(lUsers[key]);
        })
        
        return rUsers;
    }
    
    public static mapLocal(lUser : ProjectClass.Local.User) : ProjectClass.Remote.User {
        try  {
            return new ProjectClass.Remote.User({
                displayName: !!lUser.displayName ? lUser.displayName : "",
                email: lUser.email,
                photoURL: !!lUser.photoURL ? lUser.photoURL : "",
                signUpDate: lUser.signUpDate!.toISOString(),
                lastLoginDate: lUser.lastLoginDate!.toISOString(),
                uid: lUser.uid
            })
        } catch (error) {
            throw new Error("Error mapping Local User to Remote User: " + error);
        }
    }
}