import { Injectable } from "@angular/core";
import { ProjectClass } from "../../classes/class";
import { MessageMapper } from "./message";
import { UserService } from "../../services/user.service";

@Injectable({
  providedIn: 'root'
})
export class GroupMapper {
    constructor(
        public messageMapper : MessageMapper,
        public userService : UserService
    ) {}

    public async mapRemoteDict(rGroups : { [key: string]: ProjectClass.Remote.GroupItem }) : Promise<{ [key: string]: ProjectClass.Local.GroupItem }> {
        const lGroups : { [key: string]: ProjectClass.Local.GroupItem } = {};

        const keys = Object.keys(rGroups);

        const groupsArray = await Promise.all(
            keys.map(key => this.mapRemoteItem(rGroups[key]))
        )

        keys.forEach ((key, index) => {
            lGroups[key] = groupsArray[index];
        })
        
        return lGroups;
    }

    public async mapRemoteItem(rGroup : ProjectClass.Remote.GroupItem) : Promise<ProjectClass.Local.GroupItem> {
        try {
            const creator = await this.userService.getUserByUID(rGroup.createdBy!)

            const lMessages : { [key: string]: ProjectClass.Local.Message } = {};

            if (rGroup.messages) {
                const keys = Object.keys(rGroup.messages);

                const messagesArray = await Promise.all(
                    keys.map(key => this.messageMapper.mapRemote(rGroup.messages![key]))
                );

                keys.forEach((key, index) => {
                    lMessages[key] = messagesArray[index];
                });
            }

            return new ProjectClass.Local.GroupItem({
                createdBy: creator,
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

    public mapLocalItem(lGroup : ProjectClass.Local.GroupItem) : ProjectClass.Remote.GroupItem {
        try {
            return new ProjectClass.Remote.GroupItem({
                createdBy: lGroup.createdBy?.uid,
                messages: null,
                createdAt: new Date().toISOString(),
                name: lGroup.name,
                description: lGroup.description,
                imgUrl: lGroup.imgUrl
            })
        } catch (error) {
            throw new Error("Error mapping Local Group to Remote Group: " + error);
        }
    }
}