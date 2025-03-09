import { Component, OnInit } from '@angular/core';
import { API } from '../../utilities/api/request';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../utilities/services/notification.service';
import { CommonModule } from '@angular/common';
import { ProjectClass } from '../../utilities/classes/class';
import { animations } from './animation';
import { DialogComponent } from '../components/dialog/dialog.component';

export enum characterFilter {
  ALPHABETIC = "Alphabétique",
  TYPE = "Type",
  RELEASE_DATE = "Date de sortie"
}

export enum filterOrder {
  UP,
  DOWN
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [FormsModule, CommonModule, DialogComponent],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
  animations: animations
})
export class CharactersComponent implements OnInit{
  public characterNameSearch : string = "";
  public loadingCharacters : boolean = true;
  public charactersCard : {hover : boolean, character : ProjectClass.CharacterListing}[] = [];
  public VisionTypeList = ProjectClass.VisionTypeList;
  public dialogVisibility : boolean = false;
  public filter : characterFilter = characterFilter.ALPHABETIC;
  public filterOrder : filterOrder = filterOrder.UP;
  public onOustideClick = () => {
    this.dialogVisibility = false;
  }
  public chevronVisibility : boolean = false;
  
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
    const nameFiltered = this.charactersCard.filter(characterCard =>
      characterCard.character.name.toLowerCase().includes(this.characterNameSearch.toLowerCase())
    );
    return this.customFilter(nameFiltered);
  }

  public nextFilter() : void {
    const filters = Object.values(characterFilter);
    const currentIndex = filters.indexOf(this.filter);
    this.filter = filters[currentIndex === filters.length - 1 ? 0 : currentIndex + 1];
  }

  public previousFilter() : void {
    const filters = Object.values(characterFilter);
    const currentIndex = filters.indexOf(this.filter);
    this.filter = filters[currentIndex === 0 ? filters.length - 1 : currentIndex - 1];
  }

  public customFilter(cards: {hover : boolean, character : ProjectClass.CharacterListing}[]): {hover : boolean, character : ProjectClass.CharacterListing}[] {
    switch(this.filter) {
      case characterFilter.ALPHABETIC:
        if(this.filterOrder == filterOrder.UP) {
          return cards.sort((a, b) => a.character.name.localeCompare(b.character.name));
        } else {
          return cards.sort((b, a) => a.character.name.localeCompare(b.character.name));
        }
      case characterFilter.TYPE:
        if(this.filterOrder == filterOrder.UP) {
          return cards.sort((a, b) => a.character.vision.localeCompare(b.character.vision));
        } else {
          return cards.sort((b, a) => a.character.vision.localeCompare(b.character.vision));
        }
      case characterFilter.RELEASE_DATE:
        if(this.filterOrder == filterOrder.UP) {
          return cards.sort((a, b) => new Date(b.character.release).getTime() - new Date(a.character.release).getTime());
        } else {
          return cards.sort((b, a) => new Date(b.character.release).getTime() - new Date(a.character.release).getTime());
        }
      default:
        return cards;
    }
  }

  public updateFilterOrder() : void {
    if(this.filterOrder === filterOrder.UP) {
      this.filterOrder = filterOrder.DOWN;
    } else {
      this.filterOrder = filterOrder.UP;
    }
  }
}
