export class CharacterListingClass {
    "name" : string
    "icon" : string
    
    constructor(init?:Partial<CharacterListingClass> ) {
        Object.assign(this, init);
      }
}