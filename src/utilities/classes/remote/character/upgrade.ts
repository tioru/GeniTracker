export class RUpgradeClass {
  name : string | null = null;
  value : string | null = null;

  constructor(init?:Partial<RUpgradeClass>) {
    Object.assign(this, init);
  }
}