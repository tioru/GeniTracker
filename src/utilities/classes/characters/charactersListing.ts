import { VisionTypeClass } from "./visionType";

export class CharacterListingClass {
    "name" : string
    "icon" : string
    "vision" : VisionTypeClass
    "release" : string
    
    constructor(init?:Partial<CharacterListingClass> ) {
        Object.assign(this, init);
      }
}