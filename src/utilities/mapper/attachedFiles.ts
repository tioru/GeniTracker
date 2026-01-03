import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";

@Injectable({
  providedIn: 'root'
})
export class AttachedFilesMapper {
  constructor() {}

  public mapRemoteArray(rAttachedFiles : ProjectClass.Remote.AttachedFiles[]) : ProjectClass.Local.AttachedFiles[] {
    return rAttachedFiles.map((rAttachedFile) => {
      return this.mapRemote(rAttachedFile);
    })
  }

  public mapRemote(rAttachedFile : ProjectClass.Remote.AttachedFiles) : ProjectClass.Local.AttachedFiles {
    try {
      return new ProjectClass.Local.AttachedFiles ({
        base64: rAttachedFile.base64,
        file: rAttachedFile.file,
        id: rAttachedFile.id
      })
    } catch (error) {
      throw new Error("Error mapping Remote AttachedFiles to Local AttachedFiles: " + error);
    }
  }
}