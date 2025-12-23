import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { MessageMapper } from "./message";

@Injectable({
  providedIn: 'root'
})
export class GroupMapper {
    constructor() {}

    public static mapRemoteDict(rGroups : { [key: string]: ProjectClass.Remote.GroupItem }) : { [key: string]: ProjectClass.Local.GroupItem } {
        const lGroups : { [key: string]: ProjectClass.Local.GroupItem } = {};

        const keys = Object.keys(rGroups);

        keys.forEach ((key) => {
            lGroups[key] = this.mapRemoteItem(rGroups[key]);
        })
        
        return lGroups;
    }

    public static mapRemoteItem(rGroup : ProjectClass.Remote.GroupItem) : ProjectClass.Local.GroupItem {
        try {
            const lMessages : { [key: string]: ProjectClass.Local.Message } = {};

            const keys = Object.keys(rGroup.messages);

            keys.forEach ((key) => {
                lMessages[key] = MessageMapper.mapRemote(rGroup.messages[key]);
            })

            return new ProjectClass.Local.GroupItem({
                createdBy: rGroup.createdBy,
                messages: lMessages,
                createdAt: rGroup.createdAt,
                name: rGroup.name,
                description: rGroup.description,
                imgUrl: rGroup.imgUrl
            })
        } catch (error) {
            throw new Error("Error mapping Remote Group to Local Group: " + error);
        }
    }
    
    public static mapLocalDict(lGroups : ProjectClass.Local.GroupItem[]) : ProjectClass.Remote.GroupItem[] {
        return lGroups.map(lGroup => this.mapLocal(lGroup));
    }

    public static mapLocal(lGroup : ProjectClass.Local.GroupItem) : ProjectClass.Remote.GroupItem {
        try {
            const rMessages : { [key: string]: ProjectClass.Remote.Message } = {};

            const keys = Object.keys(lGroup.messages);

            keys.forEach ((key) => {
                rMessages[key] = MessageMapper.mapLocal(lGroup.messages[key]);
            })

            return new ProjectClass.Remote.GroupItem({
                createdBy: lGroup.createdBy,
                messages: rMessages,
                createdAt: lGroup.createdAt,
                name: lGroup.name,
                description: lGroup.description,
                imgUrl: lGroup.imgUrl
            })
        } catch (error) {
            throw new Error("Error mapping Local Group to Remote Group: " + error);
        }
    }
}