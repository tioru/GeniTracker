import { LAttributeScalingClass } from "./attributeScaling";
import { LUpgradeClass } from "./upgrade";

export class LSkillTalentsClass {
  name : string | null = null;
  unlock : string | null = null;
  description : string | null = null;
  upgrades : Array<LUpgradeClass> = [];
  type : string | null = null;
  attributeScaling : Array<LAttributeScalingClass> = [];

  constructor(init?:Partial<LSkillTalentsClass>) {
    Object.assign(this, init);
  }
}