import { LAscentionMaterialsClass } from "./local/character/ascensionMaterials";
import { LAttributeScalingClass } from "./local/character/attributeScaling";
import { LCharacterClass } from "./local/character/character";
import { LCharacterArtsClass } from "./local/character/characterArt";
import { LCharacterArtsArray, LCharacterArtsTypeClass, LCharacterArtsTypeListEnum } from "./local/character/characterArtsType";
import { LCharacterListingClass } from "./local/character/charactersListing";
import { LConstellationClass } from "./local/character/constellations";
import { LPassiveTalentsClass } from "./local/character/passiveTalents";
import { LSkillTalentsClass } from "./local/character/skillTalents";
import { LUpgradeClass } from "./local/character/upgrade";
import { LVisionTypeClass, LVisionTypeListEnum } from "./local/character/visionType";
import { LAttachedFile } from "./local/chat/attachedFile";
import { LGroupClass } from "./local/chat/group";
import { LGroupItem } from "./local/chat/groupItem";
import { LMessageClass } from "./local/chat/message";
import { LDailyResetClass } from "./local/dailyReset/dailyReset";
import { LUserClass } from "./local/user/user";
import { LVersionClass } from "./local/version/version";
import { LWeaponClass } from "./local/weapon/weapon";
import { LWeaponListingClass } from "./local/weapon/weaponsListing";
import { RAscentionMaterialsClass } from "./remote/character/ascensionMaterials";
import { RAttributeScalingClass } from "./remote/character/attributeScaling";

import { RCharacterClass } from "./remote/character/character";
import { RCharacterArtsClass } from "./remote/character/characterArt";
import { RCharacterArtsArray, RCharacterArtsTypeClass, RCharacterArtsTypeListEnum } from "./remote/character/characterArtsType";
import { RCharacterListingClass } from "./remote/character/charactersListing";
import { RConstellationClass } from "./remote/character/constellations";
import { RPassiveTalentsClass } from "./remote/character/passiveTalents";
import { RSkillTalentsClass } from "./remote/character/skillTalents";
import { RUpgradeClass } from "./remote/character/upgrade";
import { RVisionTypeClass, RVisionTypeListEnum } from "./remote/character/visionType";
import { RAttachedFile } from "./remote/chat/attachedFile";
import { RGroupClass } from "./remote/chat/group";
import { RGroupItem } from "./remote/chat/groupItem";
import { RMessageClass } from "./remote/chat/message";
import { RDailyResetClass } from "./remote/dailyReset/dailyReset";
import { RUserClass } from "./remote/user/user";
import { RVersionClass } from "./remote/version/version";
import { RWeaponClass } from "./remote/weapon/weapon";
import { RWeaponListingClass } from "./remote/weapon/weaponsListing";

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
        export class Version extends LVersionClass{};
        export class Message extends LMessageClass {};
        export class Group extends LGroupClass{};
        export class GroupItem extends LGroupItem {};
        export class User extends LUserClass{};
        export class AttachedFile extends LAttachedFile{};
        export class DailyReset extends LDailyResetClass{};
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
        export class Version extends RVersionClass{};
        export class Message extends RMessageClass{};
        export class Group extends RGroupClass{};
        export class GroupItem extends RGroupItem {};
        export class User extends RUserClass {};
        export class AttachedFile extends RAttachedFile{};
        export class DailyReset extends RDailyResetClass{};
    }
}