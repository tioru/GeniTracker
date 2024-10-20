import { Component, OnInit } from '@angular/core';
import { API } from '../../utilities/api/request';
import { FormsModule } from '@angular/forms';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';
import { CommonModule } from '@angular/common';
import { ProjectClass } from '../../utilities/classes/class';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss'
})
export class CharactersComponent implements OnInit{
  public characterNameSearch : string = ""
  public characters : Array<ProjectClass.CharacterListing> = []
  public loadingCharacters = true
  
  constructor(
    public charactersService : API.Characters,
    public notificationService : NotificationService
  ) {}

  ngOnInit(): void {
    this.charactersService.getCharactersNameAndIcon().subscribe((data) => {
      this.characters = data
      this.loadingCharacters = false
    })
  }

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
