import { LSkillTalentsClass } from "./skillTalents"
import { LPassiveTalentsClass } from "./passiveTalents"
import { LConstellationClass } from "./constellations"
import { LAscentionMaterialsClass } from "./ascensionMaterials"
import { LVisionTypeClass } from "./visionType"

export class LCharacterClass {
  name : string | null = null;
  title : string | null = null;
  vision : LVisionTypeClass | null = null;
  weapon : string | null = null;
  gender : string | null = null;
  nation : string | null = null;
  affiliation : string | null = null;
  rarity : number | null = null;
  releaseDate : string | null = null;
  constellation : string | null = null;
  birthday : string | null = null;
  description : string | null = null;
  skillTalents : Array<LSkillTalentsClass> = [];
  passiveTalents : Array<LPassiveTalentsClass> = [];
  constellations : Array<LConstellationClass> = [];
  visionKey : string | null = null;
  weaponType : string | null = null;
  ascensionMaterials : {
    level20 : LAscentionMaterialsClass[]
    level40 : LAscentionMaterialsClass[]
    level50 : LAscentionMaterialsClass[]
    level60 : LAscentionMaterialsClass[]
    level70 : LAscentionMaterialsClass[]
    level80 : LAscentionMaterialsClass[]
  } | null = null;
  id : string | null = null;

  constructor(init?:Partial<LCharacterClass>) {
    Object.assign(this, init);
  }
}