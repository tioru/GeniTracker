export class AscentionMaterialsClass {
    "name" : string
    "value" : number
    
    constructor(init?:Partial<AscentionMaterialsClass> ) {
        Object.assign(this, init);
      }
}