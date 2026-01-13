export class RWeaponListingClass {
  name : string | null = null;
  icon : string | null = null;
  rarity : number | null = null;
    
  constructor(init?:Partial<RWeaponListingClass>) {
    Object.assign(this, init);
  }
}