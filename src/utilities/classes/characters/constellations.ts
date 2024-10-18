export class ConstellationClass {
    "name" : string
    "unlock" : string
    "description" : string
    "level" : number

    constructor(init?:Partial<ConstellationClass> ) {
        Object.assign(this, init);
      }
}