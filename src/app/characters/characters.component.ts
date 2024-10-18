import { Component } from '@angular/core';
import { API } from '../../utilities/api/request';
import { FormsModule } from '@angular/forms';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss'
})
export class CharactersComponent {
  public characterNameSearch : string = ""
  public charactersName : Array<string> = []  
  
  constructor(
    public charactersService : API.Characters,
    public notificationService : NotificationService
  ) {}

  /*private getCharactersNameAndIcon() : void {
    this.charactersService.getCharactersNameAndIcon()
  }*/

  public getCharacter() : void {
    this.charactersService.getCharacter(this.characterNameSearch).subscribe(
      (result) => {
        if (result) {
          this.notificationService.addNotification({
            title: 'Récupération réussi',
            severity : notificationSeverity.OK,
            delay: 4000,
            sticky: false
          })
        }
      }
    )
  }
}
