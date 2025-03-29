import { Component, OnInit } from '@angular/core';
import { API } from '../../utilities/api/request';
import { FormsModule } from '@angular/forms';
import { NotificationService, notificationModel, notificationSeverity } from '../../utilities/services/notification.service';
import { CommonModule } from '@angular/common';
import { ProjectClass } from '../../utilities/classes/class';
import { animations } from './animation';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { zip } from 'rxjs';
import { CharacterMapper } from '../../utilities/mapper/character';
import { CharacterArtsMapper } from '../../utilities/mapper/characterArts';
import { CharacterListingMapper } from '../../utilities/mapper/characterListing';

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
  public charactersCard : {hover : boolean, character : ProjectClass.Local.CharacterListing}[] = [];
  public VisionTypeList = ProjectClass.Local.VisionTypeList;
  public dialogVisibility : boolean = false;
  public filter : characterFilter = characterFilter.ALPHABETIC;
  public filterOrder : filterOrder = filterOrder.UP;
  public chevronVisibility : boolean = false;
  public dialogStyle : typeof DialogStyle = DialogStyle;

  public selectedChar : ProjectClass.Local.Character | null = null;
  public selectedCharArts : ProjectClass.Local.CharacterArts | null = null;
  
  constructor(
    public charactersService : API.Characters,
    public notificationService : NotificationService,
    public characterMapper : CharacterMapper,
    public characterArtsMapper : CharacterArtsMapper,
    public characterListingMapper : CharacterListingMapper
  ) {}

  ngOnInit(): void {
    this.charactersService.getCharactersLiteInformations().subscribe((data) => {
      data.forEach((character) => {
        this.charactersCard.push({hover: false, character: this.characterListingMapper.mapRemote(character)})
      })
      this.loadingCharacters = false;
    })
  }

  public getGlobalCharacterInformations(name : string) : void {
    zip(
      this.charactersService.getCharacterInformations(name),
      this.charactersService.getCharacterArts(name)
    ).subscribe({
      next: (response) => {
        this.selectedChar = this.characterMapper.mapRemote(response[0]);
        this.selectedCharArts = this.characterArtsMapper.mapRemote(response[1]);
        this.dialogVisibility = true;
        console.log("Char : ", this.selectedChar)
        console.log("Art : ", this.selectedCharArts)
      },
      error: (error) => {
        console.error(error)
        const notification : notificationModel = {title: "Erreur", severity: notificationSeverity.ERROR}
        this.notificationService.addNotification(notification)
      }
    })
  }

  get filteredCharactersCard(): {hover : boolean, character : ProjectClass.Local.CharacterListing}[] {
    const nameFiltered = this.charactersCard.filter(characterCard => {
      if (characterCard.character.name) {
        return characterCard.character.name.toLowerCase().includes(this.characterNameSearch.toLowerCase())
      }
      return false;
    });
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

  public customFilter(cards: {hover : boolean, character : ProjectClass.Local.CharacterListing}[]): {hover : boolean, character : ProjectClass.Local.CharacterListing}[] {
    switch(this.filter) {
      case characterFilter.ALPHABETIC:
        if(this.filterOrder == filterOrder.UP) {
          return cards.sort((a, b) => (a.character.name!).localeCompare(b.character.name!));
        } else {
          return cards.sort((b, a) => (a.character.name!).localeCompare(b.character.name!));
        }
      case characterFilter.TYPE:
        if(this.filterOrder == filterOrder.UP) {
          return cards.sort((a, b) => (a.character.vision!).localeCompare(b.character.vision!));
        } else {
          return cards.sort((b, a) => (a.character.vision!).localeCompare(b.character.vision!));
        }
      case characterFilter.RELEASE_DATE:
        if(this.filterOrder == filterOrder.UP) {
          return cards.sort((a, b) => new Date(b.character.release!).getTime() - new Date(a.character.release!).getTime());
        } else {
          return cards.sort((b, a) => new Date(b.character.release!).getTime() - new Date(a.character.release!).getTime());
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
