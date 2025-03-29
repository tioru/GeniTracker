import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";

@Injectable({
  providedIn: 'root'
})
export class UpgradesMapper {
    constructor() {}

    public mapRemoteArray(rUpgradeArray : ProjectClass.Remote.Upgrade[]) : ProjectClass.Local.Upgrade[] {
        return rUpgradeArray.map((rUpgrade) => {
            return this.mapRemote(rUpgrade)
        })
    }

    public mapRemote(rUpgrade : ProjectClass.Remote.Upgrade) : ProjectClass.Local.Upgrade {
        return new ProjectClass.Local.Upgrade({
            name : rUpgrade.name,
            value : rUpgrade.value,
        })
    }
}