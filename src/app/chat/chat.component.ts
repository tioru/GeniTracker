import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { Database, onValue, push, ref, set } from '@angular/fire/database';
import { ProjectClass } from '../../utilities/classes/class';
import { GroupMapper } from '../../utilities/mapper/group';
import { MessageMapper } from '../../utilities/mapper/message';
import { UserService } from '../../utilities/services/user.service';
import { User } from '@angular/fire/auth';
import { ImageCacheService } from '../../utilities/services/image-cache.service';
import { TooltipComponent } from '../components/tooltip/tooltip.component';
import { animations } from '../animation';
import { MessageService } from '../../utilities/services/message.service';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';

const DEFAULT_GROUP_NAME = "Général";

export enum MESSAGE_MODE {
  CREATE,
  UPDATE
} 

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule, TooltipComponent],
  templateUrl: './chat.component.html',
  animations: animations,
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit{
  private database = inject(Database);
  
  private dbRef = ref(this.database, 'groups');

  public dialogStyle : typeof DialogStyle = DialogStyle;

  public groups : { [key: string]: ProjectClass.Local.GroupItem } = {};

  public selectedGroupKey : string = "";

  public newMessageContent : string = "";

  public messagesSortedByDate : {[key : string]: ProjectClass.Local.Message} = {}

  @Input() chatVisibility : boolean = false;

  @Input() onCloseCallBack : () => void = () => {};

  public currentUser : User | null = null;

  public currentCustomUser : ProjectClass.Local.User | null = null;

  private notificationSeverity : typeof notificationSeverity = notificationSeverity;

  public messageMode : typeof MESSAGE_MODE = MESSAGE_MODE;

  public selectedMessageMode : MESSAGE_MODE = MESSAGE_MODE.CREATE;

  public selectedMessageToUpdate : ProjectClass.Local.Message | null = null;

  ngOnInit() {
    this.chatListening();
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userService.getUserByUID(user?.uid!).then((customUser) => {
        this.currentCustomUser = customUser;
      });
    });
  }

  constructor(
    public userService : UserService,
    public groupMapper : GroupMapper,
    public messageMapper : MessageMapper,
    public imageCacheService : ImageCacheService,
    public messageService : MessageService,
    public notificationService : NotificationService
  ) {}

  private chatListening() {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.groupMapper.mapRemoteDict(snapshot.val()).then((result) => {
          this.groups = result;
          if (this.isNearTheBottom()) {
            this.goToBottom()
          }

          if (!this.selectedGroupKey) {
            Object.keys(this.groups).forEach((groupKey) => {
              if (this.groups[groupKey].name === DEFAULT_GROUP_NAME) {
                this.selectedGroupKey = groupKey;
              }
            });
          }

          if (!this.selectedGroupKey) {
            this.selectedGroupKey = Object.keys(this.groups)[0];
          }
        });
      }
    });
  };

  get groupsNames() : string[] {
    return Object.entries(this.groups).sort((a, b) => {
      const dateA = a[1].createdAt ? new Date(a[1].createdAt).getTime() : 0;
      const dateB = b[1].createdAt ? new Date(b[1].createdAt).getTime() : 0;
      return dateA - dateB;
    })
    .map(([key, group]) => group.name!);
  }

  public openGroup(groupKey : string) : void {
    this.selectedGroupKey = groupKey;
  }

  public async sendMessage(): Promise<void> {
    if (!this.currentUser) return;

    const dbRef = ref(this.database, 'groups/' + this.selectedGroupKey + '/messages');
    
    const newMessageRef = push(dbRef);
    const messageId = newMessageRef.key;
        
    set(newMessageRef, this.messageMapper.mapLocal(new ProjectClass.Local.Message({
      id: messageId!,
      message: this.newMessageContent,
      date: new Date(),
      user: this.currentCustomUser,
      modified: false,
      seenBy: [this.currentCustomUser!],
    }))).then(() => {
      this.newMessageContent = "";
    });
  }

  public getGroupKeyByName(groupName: string): string {
    for (const [key, group] of Object.entries(this.groups)) {
      if (group.name === groupName) {
        return key;
      }
    }
    return "";
  }

  public getGroupBykey(key : string) : ProjectClass.Local.GroupItem {
    return this.groups[key];
  }

  public getLastMessager(groupKey: string) : string {
    return Object.values(this.groups[groupKey].messages).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    })[Object.values(this.groups[groupKey].messages).length - 1].user?.displayName!
  }

  public getTimeSinceLastMessage(groupKey: string) : string {
    const lastMessage = Object.values(this.groups[groupKey].messages).sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
    })[Object.values(this.groups[groupKey].messages).length - 1];
    
    if (!lastMessage || !lastMessage.date) return "";
    
    return this.getTimeSince(lastMessage.date);
  }

  public createNewGroup() : void {
    
  }

  public getCurrentGroupMessages() : ProjectClass.Local.Message[] {
    return Object.values(this.groups[this.selectedGroupKey].messages).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
  }

  public getTimeSince(date: Date | string): string {
    if (!date) return "";

    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return "à l'instant";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
    } else if (diffInHours < 24) {
        return `${diffInHours} h`;
    } else {
        return `${diffInDays} j`;
    }
  }

  public isNearTheBottom(): boolean {
    const messagesDisplay = document.querySelector('.messagesDisplay') as HTMLElement;
    
    if (!messagesDisplay) {
      return false;
    }

    const threshold = 100; // pixels de tolérance
    const scrollTop = messagesDisplay.scrollTop;
    const scrollHeight = messagesDisplay.scrollHeight;
    const clientHeight = messagesDisplay.clientHeight;

    // Distance entre la position actuelle et le bas
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    console.log("Distance entre l'utilisateur et le bas ", distanceFromBottom)

    return distanceFromBottom <= threshold;
  }

  public goToBottom() : void {
    setTimeout(() => {
      const messagesDisplay = document.querySelector('.messagesDisplay') as HTMLElement;
      if (messagesDisplay) {
        messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
      }
    }, 0);
  }

  public updateMessage() : void {
    if (this.currentCustomUser?.uid !== this.selectedMessageToUpdate!.user?.uid) {
      this.notificationService.addNotification({
        title: 'Modification impossible',
        severity: this.notificationSeverity.ERROR,
        detail: `La modification d'un message n'est possible que pour son créateur.`,
        sticky: true
      });
    } else {
      this.messageService.updateMessage(this.selectedGroupKey, this.selectedMessageToUpdate!).then((result) => {
        if (result) {
          this.exitUpdateMode();
        }
      })
    }
  }

  public deleteMessage(message : ProjectClass.Local.Message) : void {
    if (this.currentCustomUser?.uid !== message.user?.uid) {
      this.notificationService.addNotification({
        title: 'Suppression impossible',
        severity: this.notificationSeverity.ERROR,
        detail: `La suppression d'un message n'est possible que pour son créateur.`,
        sticky: true
      });
    } else {      
      this.messageService.deleteMessage(this.selectedGroupKey, message.id!)
    }
  }

  public get messageInputContent(): string {
    return this.selectedMessageMode === this.messageMode.UPDATE && this.selectedMessageToUpdate 
      ? this.selectedMessageToUpdate.message! 
      : this.newMessageContent;
  }

  public set messageInputContent(value: string) {
    if (this.selectedMessageMode === this.messageMode.UPDATE && this.selectedMessageToUpdate) {
      this.selectedMessageToUpdate.message = value;
    } else {
      this.newMessageContent = value;
    }
  }

  public selectMessageForUpdate(message : ProjectClass.Local.Message) : void {
    this.selectedMessageToUpdate = structuredClone(message)
    this.selectedMessageToUpdate.modified = true;
  }

  public exitUpdateMode() : void {
    this.selectedMessageMode = MESSAGE_MODE.CREATE;
    this.selectedMessageToUpdate = null;
  }

  public trackByMessageId(index: number, message: ProjectClass.Local.Message): string {
    return message.id || index.toString();
  }
}