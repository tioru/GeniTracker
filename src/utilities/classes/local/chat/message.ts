import { LUserClass } from "../users/user";
import { LAttachedFile } from "./attachedFile";

export class LMessageClass {
  user : LUserClass | null = null;
  message : string | null = null;
  date : Date | null = null;
  modified : boolean | null = null;
  seenBy : LUserClass[] = [];
  attachedFiles : LAttachedFile[] = [];
  id : string | null = null;

  constructor(init?:Partial<LMessageClass>) {
    Object.assign(this, init);
  }
}