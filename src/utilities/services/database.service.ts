import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { Client, ID, Models, Storage } from "node-appwrite";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private client: Client;
  private storage: Storage;

  constructor() {
    this.client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject(environment.writeappConfig.projectId)
      .setKey(environment.writeappConfig.apiKey);

    this.storage = new Storage(this.client);
  }

  public async getFilesFromIDsArray(fileIds : string[]) : Promise<ProjectClass.Remote.AttachedFiles[]> {
    return Promise.all(fileIds.map((fileId) => this.getFileFromID(fileId)))
  }

  public async getFileFromID(fileId: string): Promise<ProjectClass.Remote.AttachedFiles> {
    try {
      const fileMetadata = await this.storage.getFile(
        environment.writeappConfig.bucketId,
        fileId
      );

      const fileArrayBuffer = await this.storage.getFileDownload(
        environment.writeappConfig.bucketId,
        fileId
      );

      const fileBlob = new Blob([fileArrayBuffer], { 
        type: fileMetadata.mimeType 
      });

      const file = new File([fileBlob], fileMetadata.name, { 
        type: fileMetadata.mimeType 
      });

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileBlob);
      });

      return new ProjectClass.Remote.AttachedFiles({
        base64: base64,
        file: file,
        id: fileId
      });

    } catch (error) {
      throw new Error(`Error while retrieving file : ${error}`);
    }
  }

  public async uploadFilesArrayToBucket(files : ProjectClass.Local.AttachedFiles[]) : Promise<ProjectClass.Local.AttachedFiles[]> {
    return Promise.all(files.map((file) => this.uploadFileToBucket(file)))
  }

  public async uploadFileToBucket(file: ProjectClass.Local.AttachedFiles): Promise<ProjectClass.Local.AttachedFiles> {
    try {
      if (!file.file) {
        throw new Error('No file provided');
      }

      const uploadedFile: Models.File = await this.storage.createFile(
        environment.writeappConfig.bucketId,
        ID.unique(),
        file.file
      );

      return {
        ...file,
        id: uploadedFile.$id
      };
    } catch (error) {
      throw new Error(`Error while uploading new file: ${error}`);
    }
  }
}