import { LUserClass } from "../users/user";
import { LAttachedFiles } from "./attachedFiles";

export class LMessageClass {
  user : LUserClass | null = null;
  message : string | null = null;
  date : Date | null = null;
  modified : boolean | null = null;
  seenBy : LUserClass[] = [];
  attachedFiles : LAttachedFiles[] = [];
  id : string | null = null;

  constructor(init?:Partial<LMessageClass>) {
    Object.assign(this, init);
  }
}