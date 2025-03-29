import { Injectable } from "@angular/core"
import { ProjectClass } from "../classes/class";

@Injectable({
  providedIn: 'root'
})
export class VisionTypeMapper {
    constructor() {}

    public mapRemote(vision: ProjectClass.Remote.VisionType): ProjectClass.Local.VisionType {
        switch(vision) {
            case ProjectClass.Remote.VisionTypeList.ANEMO:
                return ProjectClass.Local.VisionTypeList.ANEMO;
            case ProjectClass.Remote.VisionTypeList.CRYO:
                return ProjectClass.Local.VisionTypeList.CRYO;
            case ProjectClass.Remote.VisionTypeList.DENDRO:
                return ProjectClass.Local.VisionTypeList.DENDRO;
            case ProjectClass.Remote.VisionTypeList.ELECTRO:
                return ProjectClass.Local.VisionTypeList.ELECTRO;
            case ProjectClass.Remote.VisionTypeList.GEO:
                return ProjectClass.Local.VisionTypeList.GEO;
            case ProjectClass.Remote.VisionTypeList.HYDRO:
                return ProjectClass.Local.VisionTypeList.HYDRO;
            case ProjectClass.Remote.VisionTypeList.PYRO:
                return ProjectClass.Local.VisionTypeList.PYRO;
            default:
                throw new Error(`Unsupported vision type: ${vision}`);
        }
    }
}