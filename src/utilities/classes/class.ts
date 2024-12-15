import { CharacterClass } from "./characters/character";
import { CharacterArtsClass } from "./characters/characterArt";
import { CharacterArtsTypeClass } from "./characters/characterArtsType";
import { CharacterListingClass } from "./characters/charactersListing";
import { VisionTypeClass, VisionTypeListEnum } from "./characters/visionType";

export namespace ProjectClass {
    export class Character extends CharacterClass{};
    export class CharacterListing extends CharacterListingClass{};
    export class CharacterArts extends CharacterArtsClass{};
    export type CharacterArtsType = CharacterArtsTypeClass;
    export type VisionType = VisionTypeClass;
    export import VisionTypeList = VisionTypeListEnum;
}