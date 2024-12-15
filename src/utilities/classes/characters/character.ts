import { SkillTalentsClass } from "./skillTalents"
import { PassiveTalentsClass } from "./passiveTalents"
import { ConstellationClass } from "./constellations"
import { AscentionMaterialsClass } from "./ascensionMaterials"
import { VisionTypeClass } from "./visionType"

export class CharacterClass {
  "name" : string
  "title" : string
  "vision" : VisionTypeClass
  "weapon" : string
  "gender" : string
  "nation" : string
  "affiliation" : string
  "rarity" : number
  "release" : string
  "constellation" : string
  "birthday" : string
  "description" : string
  "skillTalents" : Array<SkillTalentsClass>
  "passiveTalents" : Array<PassiveTalentsClass>
  "constellations" : Array<ConstellationClass>
  "vision_key" : string
  "weapon_type" : string
  "ascension_materials" : {
    "level20" : AscentionMaterialsClass
    "level40" : AscentionMaterialsClass
    "level50" : AscentionMaterialsClass
    "level60" : AscentionMaterialsClass
    "level70" : AscentionMaterialsClass
    "level80" : AscentionMaterialsClass
  }
  "id" : string

  constructor(init?:Partial<CharacterClass> ) {
    Object.assign(this, init);
  }
}