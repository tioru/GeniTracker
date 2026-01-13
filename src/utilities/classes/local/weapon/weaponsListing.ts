export class LWeaponListingClass {
  name : string | null = null;
  icon : string | null = null;
  rarity : number | null = null;
    
  constructor(init?:Partial<LWeaponListingClass>) {
    Object.assign(this, init);
  }
}