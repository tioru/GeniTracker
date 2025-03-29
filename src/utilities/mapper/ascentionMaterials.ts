import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";

@Injectable({
  providedIn: 'root'
})
export class AscentionMaterialsMapper {
    constructor() {}

    public mapRemoteArray(rAscentionMaterialsArray : ProjectClass.Remote.AscentionMaterials[]) : ProjectClass.Local.AscentionMaterials[] {
        return rAscentionMaterialsArray.map((rAscentionMaterial : ProjectClass.Remote.AscentionMaterials) => {
            return this.mapRemote(rAscentionMaterial);
        })
    }
    
    public mapRemote(rAscentionMaterials : ProjectClass.Remote.AscentionMaterials) : ProjectClass.Local.AscentionMaterials {
        return new ProjectClass.Local.AscentionMaterials({
            name: rAscentionMaterials.name,
            value: rAscentionMaterials.value
        })
    }
}