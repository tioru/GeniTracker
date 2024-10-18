import { AttributeScalingClass } from "./attributeScaling";
import { UpgradeClass } from "./upgrade";

export class SkillTalentsClass {
    "name" : string
    "unlock" : string
    "description" : string
    "upgrades" : Array<UpgradeClass>
    "type" : string
    "attribute-scaling" : Array<AttributeScalingClass>

    constructor(init?:Partial<SkillTalentsClass> ) {
        Object.assign(this, init);
      }
}