import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { Database, onValue, ref } from '@angular/fire/database';
import { ChatMapper } from '../../utilities/mapper/chat';
import { ProjectClass } from '../../utilities/classes/class';
import { VersionMapper } from '../../utilities/mapper/version';
import { GroupMapper } from '../../utilities/mapper/group';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  public dialogStyle : typeof DialogStyle = DialogStyle;

  public groups : ProjectClass.Local.Group[] = [];

  @Input() chatVisibility : boolean = false;

  @Input() onCloseCallBack : () => void = () => {};

  private database = inject(Database);

  ngOnInit() {
    this.chatListening();
  }

  async ngAfterViewInit() {
    await this.chatInitializing();
  }

  constructor() {}

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
}