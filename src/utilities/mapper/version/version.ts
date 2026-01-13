import { Injectable } from "@angular/core";
import { ProjectClass } from "../../classes/class";

@Injectable({
  providedIn: 'root'
})
export class VersionMapper {
    constructor() {}

    public static mapRemoteArray(rVersions : ProjectClass.Remote.Version[]) : ProjectClass.Local.Version[] {
        return rVersions.map(rVersion => this.mapRemote(rVersion));
    }

    public static mapRemote(rVersion : ProjectClass.Remote.Version) : ProjectClass.Local.Version {
        return new ProjectClass.Local.Version({
            version : rVersion.version,
            active : rVersion.current_version,
            title : rVersion.title,
            selected : rVersion.current_version,
            imgUrl : rVersion.img_url,
            startDate : rVersion.start_date,
            endDate : rVersion.end_date
        })
    }

    public static mapLocalArray(lVersions : ProjectClass.Local.Version[]) : ProjectClass.Remote.Version[] {
        return lVersions.map(lVersion => this.mapLocal(lVersion));
    }

    public static mapLocal(lVersion : ProjectClass.Local.Version) : ProjectClass.Remote.Version {
        return new ProjectClass.Remote.Version({
            current_version : lVersion.active,
            version : lVersion.version,
            title : lVersion.title,
            img_url : lVersion.imgUrl,
            start_date : lVersion.startDate,
            end_date : lVersion.endDate
        })
    }
}