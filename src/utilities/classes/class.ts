import { CharacterClass } from "./characters/character";
import { CharacterListingClass } from "./characters/charactersListing";

export namespace ProjectClass {
    export class Character extends CharacterClass{}
    export class CharacterListing extends CharacterListingClass{}
}