import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { SkillTalentsMapper } from "./skillTalents";
import { PassiveTalentsMapper } from "./passiveTalents";
import { ConstellationsMapper } from "./constellations";
import { AscentionMaterialsMapper } from "./ascentionMaterials";
import { VisionTypeMapper } from "./visionType";

@Injectable({
  providedIn: 'root'
})
export class CharacterMapper {
    constructor(
        public skillTalentsMapper : SkillTalentsMapper,
        public passiveTalentsMapper : PassiveTalentsMapper,
        public constellationsMapper : ConstellationsMapper,
        public ascentionMaterialsMapper : AscentionMaterialsMapper,
        public visionTypeMapper : VisionTypeMapper
    ) {}

    public mapRemoteArray(rCharacterArray : ProjectClass.Remote.Character[]) : ProjectClass.Local.Character[] {
        return rCharacterArray.map((rCharacter : ProjectClass.Remote.Character) => {
            return this.mapRemote(rCharacter)
        })
    }

    public mapRemote(rCharacter : ProjectClass.Remote.Character) : ProjectClass.Local.Character {
        return new ProjectClass.Local.Character({
            name : rCharacter.name,
            title : rCharacter.title,
            vision : rCharacter.vision ? this.visionTypeMapper.mapRemote(rCharacter.vision) : null,
            weapon : rCharacter.weapon,
            gender : rCharacter.gender,
            nation : rCharacter.nation,
            affiliation : rCharacter.affiliation,
            rarity : rCharacter.rarity,
            release : rCharacter.release,
            constellation : rCharacter.constellation,
            birthday : rCharacter.birthday,
            description : rCharacter.description,
            skillTalents : this.skillTalentsMapper.mapRemoteArray(rCharacter.skillTalents),
            passiveTalents : this.passiveTalentsMapper.mapRemoteArray(rCharacter.passiveTalents),
            constellations : this.constellationsMapper.mapRemoteArray(rCharacter.constellations),
            visionKey : rCharacter.vision_key,
            weaponType : rCharacter.weapon_type,
            ascensionMaterials : {
                level20 : rCharacter.ascension_materials?.level20 ? this.ascentionMaterialsMapper.mapRemoteArray(rCharacter.ascension_materials.level20) : [],
                level40 : rCharacter.ascension_materials?.level40 ? this.ascentionMaterialsMapper.mapRemoteArray(rCharacter.ascension_materials.level40) : [],
                level50 : rCharacter.ascension_materials?.level50 ? this.ascentionMaterialsMapper.mapRemoteArray(rCharacter.ascension_materials.level50) : [],
                level60 : rCharacter.ascension_materials?.level60 ? this.ascentionMaterialsMapper.mapRemoteArray(rCharacter.ascension_materials.level60) : [],
                level70 : rCharacter.ascension_materials?.level70 ? this.ascentionMaterialsMapper.mapRemoteArray(rCharacter.ascension_materials.level70) : [],
                level80 : rCharacter.ascension_materials?.level80 ? this.ascentionMaterialsMapper.mapRemoteArray(rCharacter.ascension_materials.level80) : [],
            },
            id: rCharacter.id
        })
    }
}