import { LAscentionMaterialsClass } from "./local/characters/ascensionMaterials";
import { LAttributeScalingClass } from "./local/characters/attributeScaling";
import { LCharacterClass } from "./local/characters/character";
import { LCharacterArtsClass } from "./local/characters/characterArt";
import { LCharacterArtsArray, LCharacterArtsTypeClass, LCharacterArtsTypeListEnum } from "./local/characters/characterArtsType";
import { LCharacterListingClass } from "./local/characters/charactersListing";
import { LConstellationClass } from "./local/characters/constellations";
import { LPassiveTalentsClass } from "./local/characters/passiveTalents";
import { LSkillTalentsClass } from "./local/characters/skillTalents";
import { LUpgradeClass } from "./local/characters/upgrade";
import { LVisionTypeClass, LVisionTypeListEnum } from "./local/characters/visionType";
import { LWeaponClass } from "./local/weapons/weapon";
import { LWeaponListingClass } from "./local/weapons/weaponsListing";
import { RAscentionMaterialsClass } from "./remote/characters/ascensionMaterials";
import { RAttributeScalingClass } from "./remote/characters/attributeScaling";

import { RCharacterClass } from "./remote/characters/character";
import { RCharacterArtsClass } from "./remote/characters/characterArt";
import { RCharacterArtsArray, RCharacterArtsTypeClass, RCharacterArtsTypeListEnum } from "./remote/characters/characterArtsType";
import { RCharacterListingClass } from "./remote/characters/charactersListing";
import { RConstellationClass } from "./remote/characters/constellations";
import { RPassiveTalentsClass } from "./remote/characters/passiveTalents";
import { RSkillTalentsClass } from "./remote/characters/skillTalents";
import { RUpgradeClass } from "./remote/characters/upgrade";
import { RVisionTypeClass, RVisionTypeListEnum } from "./remote/characters/visionType";
import { RWeaponClass } from "./remote/weapons/weapon";
import { RWeaponListingClass } from "./remote/weapons/weaponsListing";

export namespace ProjectClass {
    export namespace Local {
        export class Character extends LCharacterClass{};
        export class CharacterListing extends LCharacterListingClass{};
        export class CharacterArts extends LCharacterArtsClass{};
        export const CharacterArtsArray = LCharacterArtsArray;
        export type CharacterArtsType = LCharacterArtsTypeClass;
        export type CharacterArtsTypeList = LCharacterArtsTypeListEnum;
        export type VisionType = LVisionTypeClass;
        export import VisionTypeList = LVisionTypeListEnum;
        export class SkillTalents extends LSkillTalentsClass{};
        export class Upgrade extends LUpgradeClass{};
        export class AttributeScaling extends LAttributeScalingClass{};
        export class PassiveTalents extends LPassiveTalentsClass{};
        export class Constellation extends LConstellationClass{};
        export class AscentionMaterials extends LAscentionMaterialsClass{};
        export class WeaponListing extends LWeaponListingClass{};
        export class Weapon extends LWeaponClass{};
    }

    export namespace Remote {
        export class Character extends RCharacterClass{};
        export class CharacterListing extends RCharacterListingClass{};
        export class CharacterArts extends RCharacterArtsClass{};
        export const CharacterArtsArray = RCharacterArtsArray;
        export type CharacterArtsType = RCharacterArtsTypeClass;
        export type CharacterArtsTypeList = RCharacterArtsTypeListEnum;
        export type VisionType = RVisionTypeClass;
        export import VisionTypeList = RVisionTypeListEnum;
        export class SkillTalents extends RSkillTalentsClass{};
        export class Upgrade extends RUpgradeClass{};
        export class AttributeScaling extends RAttributeScalingClass{};
        export class PassiveTalents extends RPassiveTalentsClass{};
        export class Constellation extends RConstellationClass{};
        export class AscentionMaterials extends RAscentionMaterialsClass{};
        export class WeaponListing extends RWeaponListingClass{};
        export class Weapon extends RWeaponClass{};
    }
}