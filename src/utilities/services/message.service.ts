import { inject, Injectable } from "@angular/core";
import { Database, ref, remove, update } from "@angular/fire/database";
import { NotificationService, notificationSeverity } from "./notification.service";
import { ProjectClass } from "../classes/class";
import { MessageMapper } from "../mapper/message";
import { FirebaseErrorService } from "./firebase-error.service";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
    private database = inject(Database);
    
    constructor(
        public notificationService : NotificationService,
        public messageMapper : MessageMapper,
        public firebaseErrorService: FirebaseErrorService
    ) { }

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
}