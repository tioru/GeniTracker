export class LAscentionMaterialsClass {
  name : string | null = null;
  value : number | null = null;
    
  constructor(init?:Partial<LAscentionMaterialsClass>) {
    Object.assign(this, init);
  }
}