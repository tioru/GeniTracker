import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { Database, onValue, ref } from '@angular/fire/database';
import { ChatMapper } from '../../utilities/mapper/chat';
import { ProjectClass } from '../../utilities/classes/class';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  public dialogStyle : typeof DialogStyle = DialogStyle;

  public chats : ProjectClass.Local.Chat[] = [];

  @Input() chatVisibility : boolean = false;

  @Input() onConnexionCallBack : () => void = () => {};

  private database = inject(Database);

  private async chatInitializing() : Promise<void> {
    return new Promise((resolve) => {
      const dbRef = ref(this.database, 'chat');
  
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          this.chats = ChatMapper.mapRemoteArray(snapshot.val());
        }
  
        resolve();
      });
    });
  }
}
