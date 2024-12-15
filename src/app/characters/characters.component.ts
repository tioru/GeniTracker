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
  public loadingCharacters : boolean = true
  public characterInfoVisibility : boolean = false
  
  constructor(
    public charactersService : API.Characters,
    public notificationService : NotificationService
  ) {}

  ngOnInit(): void {
    this.charactersService.getCharactersLiteInformations().subscribe((data) => {
      this.characters = data
      this.loadingCharacters = false
      console.log(this.characters)
    })
  }

  public getCharacterInformations(name : string) : void {
    this.charactersService.getCharacterInformations(name).subscribe(
      (charInformations) => {
        if (charInformations) {
          console.log(charInformations)
        }
      }
    )
    this.charactersService.getCharacterArts(name).subscribe(
      (characterArts) => {
        if (characterArts) {
          console.log(characterArts)
        }
      }
    )
  }

  public isSearched(characterName : string) {
    if (this.characterNameSearch != "") {
      return characterName.includes(this.characterNameSearch)
    }
    return true
  }
}
