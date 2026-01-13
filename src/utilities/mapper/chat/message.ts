import { Injectable } from "@angular/core";
import { UserService } from "../../services/user.service";
import { AttachedFilesMapper } from "./attachedFiles";
import { DatabaseService } from "../../services/database.service";
import { ProjectClass } from "../../classes/class";


@Injectable({
  providedIn: 'root'
})
export class MessageMapper {
    constructor(
        public userService : UserService,
        public attachedFilesMapper : AttachedFilesMapper,
        public databaseService : DatabaseService
    ) {}

    public async mapRemoteArray(rMessages : ProjectClass.Remote.Message[]) : Promise<ProjectClass.Local.Message[]> {
        return Promise.all(rMessages.map(rMessage => this.mapRemote(rMessage)));
    }
    
    public async mapRemote(rMessage: ProjectClass.Remote.Message): Promise<ProjectClass.Local.Message> {
        try {
            const user = await this.userService.getUserByUID(rMessage.userUID!);

            const seenUsersWithNull = await Promise.all(rMessage.seenBy.map(userId => this.userService.getUserByUID(userId)));
            const seenUsers = seenUsersWithNull.filter((user) => user !== null);

            let attachedFiles: ProjectClass.Remote.AttachedFile[] = [];

            if (rMessage.attachedFilesIds && rMessage.attachedFilesIds.length > 0) {
                attachedFiles = await this.databaseService.getFilesFromIDsArray(rMessage.attachedFilesIds);
            }

            return new ProjectClass.Local.Message({
                user: user,
                message: rMessage.message,
                date: new Date(rMessage.date!),
                modified: rMessage.modified,
                seenBy: seenUsers,
                attachedFiles: attachedFiles.length > 0 ? this.attachedFilesMapper.mapRemoteArray(attachedFiles) : [],
                id: rMessage.id
            })
        } catch (error) {
            throw new Error("Error while mapping Remote Message to Local Message: " + error);
        }
    }
    
    public mapLocalArray(lMessages : ProjectClass.Local.Message[]) : ProjectClass.Remote.Message[] {
        return lMessages.map(lMessage => this.mapLocal(lMessage));
    }
    
    public mapLocal(lMessage : ProjectClass.Local.Message) : ProjectClass.Remote.Message {
        try {
            return new ProjectClass.Remote.Message({
                userUID: lMessage.user?.uid,
                message: lMessage.message,
                date: lMessage.date!.toISOString(),
                modified: lMessage.modified,
                seenBy: lMessage.seenBy.map((user) => user.uid!),
                attachedFilesIds: lMessage.attachedFiles.map((attachedFile) => attachedFile.id!),
                id: lMessage.id
            })
        } catch (error) {
            throw new Error("Error while mapping Local Message to Remote Message: " + error);
        }
    }
}