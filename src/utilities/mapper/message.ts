import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";

@Injectable({
  providedIn: 'root'
})
export class MessageMapper {
    constructor() {}

    public static mapRemoteArray(rMessages : ProjectClass.Remote.Message[]) : ProjectClass.Local.Message[] {
        return rMessages.map(rMessage => this.mapRemote(rMessage));
    }
    
    public static mapRemote(rMessage : ProjectClass.Remote.Message) : ProjectClass.Local.Message {
        return new ProjectClass.Local.Message({
            userName : rMessage.userName,
            message : rMessage.message,
            date : rMessage.date,
            modified : rMessage.modified,
            seenBy : rMessage.seenBy
        })
    }
    
    public static mapLocalArray(lMessages : ProjectClass.Local.Message[]) : ProjectClass.Remote.Message[] {
        return lMessages.map(lMessage => this.mapLocal(lMessage));
    }
    
    public static mapLocal(lMessage : ProjectClass.Local.Message) : ProjectClass.Remote.Message {
        return new ProjectClass.Remote.Message({
            userName: lMessage.userName,
            message: lMessage.message,
            date: lMessage.date,
            modified: lMessage.modified,
            seenBy: lMessage.seenBy
        })
    }
}