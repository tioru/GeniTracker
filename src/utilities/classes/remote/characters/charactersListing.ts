import { RVisionTypeClass } from "./visionType";

export class RCharacterListingClass {
  name : string | null = null;
  icon : string | null = null;
  vision : RVisionTypeClass | null = null;
  release : string | null = null;
    
  constructor(init?:Partial<RCharacterListingClass>) {
    Object.assign(this, init);
  }
}