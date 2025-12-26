import { LUserClass } from "../users/user";

export class LMessageClass {
  user : LUserClass | null = null;
  message : string | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : LUserClass[] = [];

  constructor(init?:Partial<LMessageClass>) {
    Object.assign(this, init);
  }
}