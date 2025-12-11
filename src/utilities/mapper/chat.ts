import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";

@Injectable({
  providedIn: 'root'
})
export class ChatMapper {
    constructor() {}

    public static mapRemoteArray(rChats : ProjectClass.Remote.Chat[]) : ProjectClass.Local.Chat[] {
            return rChats.map(rChat => this.mapRemote(rChat));
        }
    
        public static mapRemote(rVersion : ProjectClass.Remote.Chat) : ProjectClass.Local.Chat {
            return new ProjectClass.Local.Chat({
                user : rVersion.user,
                message : rVersion.message,
                date : rVersion.date,
                modified : rVersion.modified,
                seenBy : rVersion.seenBy
            })
        }
    
        public static mapLocalArray(lChats : ProjectClass.Local.Chat[]) : ProjectClass.Remote.Chat[] {
            return lChats.map(lChat => this.mapLocal(lChat));
        }
    
        public static mapLocal(lChat : ProjectClass.Local.Chat) : ProjectClass.Remote.Chat {
            return new ProjectClass.Remote.Chat({
                user: lChat.user,
                message: lChat.message,
                date: lChat.date,
                modified: lChat.modified,
                seenBy: lChat.seenBy
            })
        }
}