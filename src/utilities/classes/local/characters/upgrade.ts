export class LUpgradeClass {
  name : string | null = null;
  value : string | null = null;

  constructor(init?:Partial<LUpgradeClass>) {
    Object.assign(this, init);
  }
}