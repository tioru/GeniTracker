import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { UpgradesMapper } from "./upgrades";
import { AttributeScallingMapper } from "./attributeScalling";

@Injectable({
  providedIn: 'root'
})
export class SkillTalentsMapper {
    constructor(
        public upgradesMapper : UpgradesMapper,
        public attributeScallingMapper : AttributeScallingMapper
    ) {}

    public mapRemoteArray(rSkillTalentsArray : ProjectClass.Remote.SkillTalents[]) : ProjectClass.Local.SkillTalents[] {
        return rSkillTalentsArray.map((rSkillTalents : ProjectClass.Remote.SkillTalents) => {
            return this.mapRemote(rSkillTalents)
        })
    }

    public mapRemote(rSkillTalents : ProjectClass.Remote.SkillTalents) : ProjectClass.Local.SkillTalents {
        return new ProjectClass.Local.SkillTalents({
            name : rSkillTalents.name,
            unlock : rSkillTalents.unlock,
            description : rSkillTalents.description,
            upgrades : this.upgradesMapper.mapRemoteArray(rSkillTalents.upgrades),
            type : rSkillTalents.type,
            attributeScaling : rSkillTalents["attribute-scaling"] ? this.attributeScallingMapper.mapRemoteArray(rSkillTalents["attribute-scaling"]) : []
        })
    }
}