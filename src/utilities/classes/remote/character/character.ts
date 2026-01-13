import { RSkillTalentsClass } from "./skillTalents"
import { RPassiveTalentsClass } from "./passiveTalents"
import { RConstellationClass } from "./constellations"
import { RAscentionMaterialsClass } from "./ascensionMaterials"
import { RVisionTypeClass } from "./visionType"

export class RCharacterClass {
  name : string | null = null;
  title : string | null = null;
  vision : RVisionTypeClass | null = null;
  weapon : string | null = null;
  gender : string | null = null;
  nation : string | null = null;
  affiliation : string | null = null;
  rarity : number | null = null;
  release : string | null = null;
  constellation : string | null = null;
  birthday : string | null = null;
  description : string | null = null;
  skillTalents : Array<RSkillTalentsClass> = [];
  passiveTalents : Array<RPassiveTalentsClass> = [];
  constellations : Array<RConstellationClass> = [];
  vision_key : string | null = null;
  weapon_type : string | null = null;
  ascension_materials : {
    level20 : RAscentionMaterialsClass[]
    level40 : RAscentionMaterialsClass[]
    level50 : RAscentionMaterialsClass[]
    level60 : RAscentionMaterialsClass[]
    level70 : RAscentionMaterialsClass[]
    level80 : RAscentionMaterialsClass[]
  } | null = null;
  id : string | null = null;

  constructor(init?:Partial<RCharacterClass> ) {
    Object.assign(this, init);
  }
}