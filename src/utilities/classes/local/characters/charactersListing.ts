import { LVisionTypeClass } from "./visionType";

export class LCharacterListingClass {
  name : string | null = null;
  icon : string | null = null;
  vision : LVisionTypeClass | null = null;
  releaseDate : string | null = null;
    
  constructor(init?:Partial<LCharacterListingClass>) {
    Object.assign(this, init);
  }
}