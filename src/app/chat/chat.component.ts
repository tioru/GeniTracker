import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { Database, onValue, push, ref } from '@angular/fire/database';
import { ProjectClass } from '../../utilities/classes/class';
import { GroupMapper } from '../../utilities/mapper/group';
import { MessageMapper } from '../../utilities/mapper/message';
import { UserService } from '../../utilities/services/user.service';
import { User } from '@angular/fire/auth';
import { ImageCacheService } from '../../utilities/services/image-cache.service';

const DEFAULT_GROUP_NAME = "Général";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
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
    public imageCacheService : ImageCacheService
  ) {}

  private chatListening() {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.groupMapper.mapRemoteDict(snapshot.val()).then((result) => {
          this.groups = result;

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

  public sendMessage() : void {
    if (!this.currentUser) return;

    const dbRef = ref(this.database, 'groups/' + this.selectedGroupKey + '/messages');

    push(dbRef, this.messageMapper.mapLocal(new ProjectClass.Local.Message({
      message: this.newMessageContent,
      date: new Date().toISOString(),
      user: this.currentCustomUser,
      modified: false,
      seenBy: [],
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

    const lastMessageDate = new Date(lastMessage.date);
    const now = new Date();
    const diffInMs = now.getTime() - lastMessageDate.getTime();

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

  public createNewGroup() : void {
    
  }

  public getCurrentGroupMessages() : ProjectClass.Local.Message[] {
    return Object.values(this.groups[this.selectedGroupKey].messages).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
  }
}