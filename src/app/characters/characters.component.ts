import { Component, OnInit } from '@angular/core';
import { API } from '../../utilities/api/request';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../utilities/services/notification.service';
import { CommonModule } from '@angular/common';
import { ProjectClass } from '../../utilities/classes/class';
import { animations } from './animation';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
  animations: animations
})
export class CharactersComponent implements OnInit{
  public characterNameSearch : string = "";
  public loadingCharacters : boolean = true;
  public characterInfoVisibility : boolean = false;
  public charactersCard : {hover : boolean, character : ProjectClass.CharacterListing}[] = [];
  public VisionTypeList = ProjectClass.VisionTypeList;
  public dialogVisibility : boolean = false;
  
  constructor(
    public charactersService : API.Characters,
    public notificationService : NotificationService
  ) {}

  ngOnInit(): void {
    this.charactersService.getCharactersLiteInformations().subscribe((data) => {
      data.forEach((character) => {
        this.charactersCard.push({hover: false, character: character})
      })
      this.loadingCharacters = false;
    })
  }

  public getCharacterInformations(name : string) : void {
    this.charactersService.getCharacterInformations(name).subscribe(
      (charInformations) => {
        if (charInformations) {
          console.log(charInformations);
        }
      }
    )
    this.charactersService.getCharacterArts(name).subscribe(
      (characterArts) => {
        if (characterArts) {
          console.log(characterArts);
        }
      }
    )
  }

  get filteredCharactersCard(): {hover : boolean, character : ProjectClass.CharacterListing}[] {
    return this.charactersCard.filter(characterCard =>
      characterCard.character.name.toLowerCase().includes(this.characterNameSearch.toLowerCase())
    );
  }
}
