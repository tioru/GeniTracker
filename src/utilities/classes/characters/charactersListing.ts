import { VisionTypeClass } from "./visionType";

export class CharacterListingClass {
    "name" : string
    "icon" : string
    "vision" : VisionTypeClass
    
    constructor(init?:Partial<CharacterListingClass> ) {
        Object.assign(this, init);
      }
}