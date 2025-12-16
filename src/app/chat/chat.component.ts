import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { Database, onValue, push, ref } from '@angular/fire/database';
import { ProjectClass } from '../../utilities/classes/class';
import { GroupMapper } from '../../utilities/mapper/group';
import { ChatMapper } from '../../utilities/mapper/chat';
import { AuthService } from '../../utilities/services/auth.service';
import { Observable, of } from 'rxjs';
import { User } from '@angular/fire/auth';

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

  public groups : ProjectClass.Local.Group[] = [];

  public selectedGroupNumber : number = 0;

  public newMessageContent : string = "";

  @Input() chatVisibility : boolean = false;

  @Input() onCloseCallBack : () => void = () => {};

  public currentUser: User | null = null;

  ngOnInit() {
    this.chatListening();
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  async ngAfterViewInit() {
    await this.chatInitializing();
  }

  constructor(
    public authService : AuthService
  ) {}

  private async chatInitializing() : Promise<void> {
    return new Promise((resolve) => {
      const dbRef = ref(this.database, 'groups');
  
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          this.groups = GroupMapper.mapRemoteArray(snapshot.val());
        }
  
        resolve();
      });
    });
  }

  private chatListening() {
    const dbRef = ref(this.database, 'groups');
  
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.groups = GroupMapper.mapRemoteArray(snapshot.val());
        console.log('Groups updated:', this.groups);
      }
    });
  };

  get groupsNames() : string[] {
    return this.groups.map(group => group.name ?? "").filter(name => name)
  }

  public openGroup(wantedGroupNumber : number) : void {
    this.selectedGroupNumber = wantedGroupNumber;
  }

  public sendMessage() : void {
    if (!this.currentUser) return;

    push(this.dbRef, ChatMapper.mapLocal(new ProjectClass.Local.Chat({
      message: this.newMessageContent,
      date: Date.now().toString(),
      userName: this.currentUser.displayName,
      modified: false,
      seenBy: []
    }))).then(() => {
      this.newMessageContent = "";
    });
  }
}