import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { Client, ID, Models, Storage } from "appwrite";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly client: Client;
  private readonly storage: Storage;

  constructor() {
    this.client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject(environment.writeappConfig.projectId)

    this.storage = new Storage(this.client);
  }

  public async getFilesFromIDsArray(fileIds: string[]) : Promise<ProjectClass.Remote.AttachedFile[]> {
    return Promise.all(fileIds.map((fileId) => this.getFileFromID(fileId)))
  }

  public async getFileFromID(fileId: string): Promise<ProjectClass.Remote.AttachedFile> {
    try {
      const fileMetadata = await this.storage.getFile({
        bucketId: environment.writeappConfig.bucketId,
        fileId: fileId
      });
    
      let fileDownloadLink = await this.storage.getFileDownload({
        bucketId: environment.writeappConfig.bucketId,
        fileId: fileId
      });
    
      const response = await fetch(fileDownloadLink as string);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
    
      const fileArrayBuffer = await response.arrayBuffer();
    
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
    
      return new ProjectClass.Remote.AttachedFile({
        base64: base64,
        file: file,
        id: fileId
      });
    
    } catch (error) {
      throw new Error(`Error while retrieving file : ${error}`);
    }
  }

  public async uploadFilesArrayToBucket(files: ProjectClass.Local.AttachedFile[]) : Promise<ProjectClass.Local.AttachedFile[]> {
    return Promise.all(files.map((file) => this.uploadFileToBucket(file)))
  }

  public async uploadFileToBucket(file: ProjectClass.Local.AttachedFile): Promise<ProjectClass.Local.AttachedFile> {
    try {
      if (!file.file) {
        throw new Error('No file provided');
      }

      const uploadedFile: Models.File = await this.storage.createFile(
        {
          bucketId : environment.writeappConfig.bucketId,
          fileId : ID.unique(),
          file : file.file
        }
      );

      return {
        ...file,
        id: uploadedFile.$id
      };
    } catch (error) {
      throw new Error(`Error while uploading new file: ${error}`);
    }
  }

  public async deleteFilesArray(files: ProjectClass.Local.AttachedFile[]): Promise<void[]> {
    return Promise.all(files.map((file) => this.deleteFile(file)))
  }

  public async deleteFile(file: ProjectClass.Local.AttachedFile): Promise<void> {
    await this.storage.deleteFile({
      bucketId: environment.writeappConfig.bucketId,
      fileId: file.id!
    })
  }
}