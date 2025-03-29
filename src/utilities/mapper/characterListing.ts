import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { VisionTypeMapper } from "./visionType";

@Injectable({
  providedIn: 'root'
})
export class CharacterListingMapper {
    constructor(
        public visionTypeMapper : VisionTypeMapper
    ) {}

    public mapRemote(rCharacterListing : ProjectClass.Remote.CharacterListing) : ProjectClass.Local.CharacterListing {
        return new ProjectClass.Local.CharacterListing({
            name : rCharacterListing.name,
            icon : rCharacterListing.icon,
            vision : rCharacterListing.vision ? this.visionTypeMapper.mapRemote(rCharacterListing.vision) : null,
            release : rCharacterListing.release,
        })
    }
}