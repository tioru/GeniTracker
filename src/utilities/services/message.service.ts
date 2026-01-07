import { inject, Injectable } from "@angular/core";
import { Database, push, ref, remove, runTransaction, set, update } from "@angular/fire/database";
import { NotificationService, notificationSeverity } from "./notification.service";
import { ProjectClass } from "../classes/class";
import { MessageMapper } from "../mapper/message";
import { FirebaseErrorService } from "./firebase-error.service";
import { GroupMapper } from "../mapper/group";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
    private readonly database = inject(Database);
    
    constructor(
        public notificationService : NotificationService,
        public messageMapper : MessageMapper,
        public firebaseErrorService: FirebaseErrorService,
        public groupMapper : GroupMapper,
        public databaseService : DatabaseService
    ) { }

    public async sendMessage(message : ProjectClass.Local.Message, groupKey : string) : Promise<boolean> {
        try {
            const dbRef = ref(this.database, 'groups/' + groupKey + '/messages');
    
            const newMessageRef = push(dbRef);
            const messageId = newMessageRef.key;

            if (message.attachedFiles.length > 0) {
                message.attachedFiles = await this.databaseService.uploadFilesArrayToBucket(message.attachedFiles)
            }

            await set(newMessageRef, this.messageMapper.mapLocal({...message, id : messageId}))
            
            return true;
        } catch (error) {
            console.error("Error while creating new message: ", error);
            return false;
        }   
    }
    
    public async updateMessage(selectedGroupKey : string, updatedMessage : ProjectClass.Local.Message) : Promise<boolean> {
        try {
            if (!updatedMessage.id || !selectedGroupKey) {
                console.error('Message ID ou groupe manquant');
                return false;
            }

            const messageRef = ref(this.database, `groups/${selectedGroupKey}/messages/${updatedMessage.id}`);

            await update(messageRef, this.messageMapper.mapLocal(updatedMessage))
            
            return true;
        } catch (error) {
            this.notificationService.addNotification({
                title: 'Erreur lors de la modification du message',
                severity: notificationSeverity.ERROR,
                detail: this.firebaseErrorService.handleFirebaseError(error),
                sticky: true
            });

            return false;
        }
    }

    public async deleteMessage(selectedGroupKey : string, messageId: string): Promise<boolean> {
        try {
            if (!messageId || !selectedGroupKey) {
                console.error('Message ID ou groupe manquant');
                return false;
            }

            const messageRef = ref(this.database, `groups/${selectedGroupKey}/messages/${messageId}`);

            await remove(messageRef);

            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du message:', error);
            return false;
        }
    } 

    public async markMessageAsSeen(selectedGroupKey : string, messageId : string, userUID : string): Promise<boolean> {
        try {
            if (!messageId || !selectedGroupKey) {
                console.error('Message ID ou groupe manquant');
                return false;
            }

            const messageRef = ref(this.database, `groups/${selectedGroupKey}/messages/${messageId}`);

            await runTransaction(messageRef, (currentMessage) => {
                if (!currentMessage) {
                    return currentMessage;
                }

                const currentSeenBy = currentMessage.seenBy;

                const alreadySeen = currentSeenBy.some(
                    (currentSeenUID: string) => currentSeenUID === userUID
                );

                if (alreadySeen) {
                    return currentMessage;
                }

                const updatedSeenBy = [
                    ...currentSeenBy,
                    userUID
                ];

                return {
                    ...currentMessage,
                    seenBy: updatedSeenBy
                };
            });

            return true;

        } catch (error) {
            console.error('Erreur lors du marquage du message comme vu:', error);
            return false;
        }
    }
}