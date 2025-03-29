export class RAscentionMaterialsClass {
  name : string | null = null;
  value : number | null = null;
  
  constructor(init?:Partial<RAscentionMaterialsClass> ) {
    Object.assign(this, init);
  }
}