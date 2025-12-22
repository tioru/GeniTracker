import { User } from "@angular/fire/auth";

export class LMessageClass {
  userName : string | null = null;
  message : string | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : User[] = [];

  constructor(init?:Partial<LMessageClass>) {
    Object.assign(this, init);
  }
}