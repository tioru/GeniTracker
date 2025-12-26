import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { UserService } from "../services/user.service";

@Injectable({
  providedIn: 'root'
})
export class MessageMapper {
    constructor(
        public userService : UserService
    ) {}

    public async mapRemoteArray(rMessages : ProjectClass.Remote.Message[]) : Promise<ProjectClass.Local.Message[]> {
        return Promise.all(rMessages.map(rMessage => this.mapRemote(rMessage)));
    }
    
    public async mapRemote(rMessage : ProjectClass.Remote.Message) : Promise<ProjectClass.Local.Message> {
        const user = await this.userService.getUserByUID(rMessage.userUID!);

        const seenUsersWithNull = await Promise.all(rMessage.seenBy.map(userId => this.userService.getUserByUID(userId)));
        const seenUsers = seenUsersWithNull.filter((user) => user !== null );
        
        return new ProjectClass.Local.Message({
            user : user,
            message : rMessage.message,
            date : new Date(rMessage.date!),
            modified : rMessage.modified,
            seenBy : seenUsers
        })
    }
    
    public async mapLocalArray(lMessages : ProjectClass.Local.Message[]) : Promise<ProjectClass.Remote.Message[]> {
        return Promise.all(lMessages.map(lMessage => this.mapLocal(lMessage)));
    }
    
    public async mapLocal(lMessage : ProjectClass.Local.Message) : Promise<ProjectClass.Remote.Message> {
        return new ProjectClass.Remote.Message({
            userUID: lMessage.user?.uid,
            message: lMessage.message,
            date: lMessage.date!.toISOString(),
            modified: lMessage.modified,
            seenBy: lMessage.seenBy.map((user) => user.uid!)
        })
    }
}