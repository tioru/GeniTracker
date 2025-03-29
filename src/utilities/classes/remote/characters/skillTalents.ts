import { RAttributeScalingClass } from "./attributeScaling";
import { RUpgradeClass } from "./upgrade";

export class RSkillTalentsClass {
  name : string | null = null;
  unlock : string | null = null;
  description : string | null = null;
  upgrades : Array<RUpgradeClass> = [];
  type : string | null = null;
  "attribute-scaling" : Array<RAttributeScalingClass> = [];

  constructor(init?:Partial<RSkillTalentsClass>) {
    Object.assign(this, init);
  }
}