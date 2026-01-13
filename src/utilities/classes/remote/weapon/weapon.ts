export class RWeaponClass {
  name : string | null = null;
  type : string | null = null;
  rarity : number | null = null;
  baseAttack : number | null = null;
  subStat : string | null = null;
  passiveName : string | null = null;
  passiveDesc : string | null = null;
  location : string | null = null;
  ascensionMaterial : string | null = null;
  id : string | null = null;

  constructor(init?:Partial<RWeaponClass>) {
    Object.assign(this, init);
  }
}