import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { ChatMapper } from "./chat";

@Injectable({
  providedIn: 'root'
})
export class GroupMapper {
    constructor() {}

    public static mapRemoteArray(rGroups : ProjectClass.Remote.Group[]) : ProjectClass.Local.Group[] {
        return rGroups.map(rGroup => this.mapRemote(rGroup));
    }
    
    public static mapRemote(rGroup : ProjectClass.Remote.Group) : ProjectClass.Local.Group {
        try {
            return new ProjectClass.Local.Group({
                name: rGroup.name,
                createdBy: rGroup.createdBy,
                messages: rGroup.messages.map(rChat => ChatMapper.mapRemote(rChat)),
                createdAt: rGroup.createdAt
            })
        } catch (error) {
            throw new Error("Error mapping Remote Group to Local Group: " + error);
        }
    }
    
    public static mapLocalArray(lGroups : ProjectClass.Local.Group[]) : ProjectClass.Remote.Group[] {
        return lGroups.map(lGroup => this.mapLocal(lGroup));
    }
    
    public static mapLocal(lGroup : ProjectClass.Local.Group) : ProjectClass.Remote.Group {
        try {
            return new ProjectClass.Remote.Group({
                name: lGroup.name,
                createdBy: lGroup.createdBy,
                messages: lGroup.messages.map(lChat => ChatMapper.mapLocal(lChat)),
                createdAt: lGroup.createdAt
            })
        } catch (error) {
            throw new Error("Error mapping Local Group to Remote Group: " + error);
        }
    }
}