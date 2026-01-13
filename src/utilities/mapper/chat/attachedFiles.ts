import { Injectable } from "@angular/core";
import { ProjectClass } from "../../classes/class";

@Injectable({
  providedIn: 'root'
})
export class AttachedFilesMapper {
  constructor() {}

  public mapRemoteArray(rAttachedFiles : ProjectClass.Remote.AttachedFile[]) : ProjectClass.Local.AttachedFile[] {
    return rAttachedFiles.map((rAttachedFile) => {
      return this.mapRemote(rAttachedFile);
    })
  }

  public mapRemote(rAttachedFile : ProjectClass.Remote.AttachedFile) : ProjectClass.Local.AttachedFile {
    try {
      return new ProjectClass.Local.AttachedFile ({
        base64: rAttachedFile.base64,
        file: rAttachedFile.file,
        id: rAttachedFile.id
      })
    } catch (error) {
      throw new Error("Error mapping Remote AttachedFile to Local AttachedFile: " + error);
    }
  }
}