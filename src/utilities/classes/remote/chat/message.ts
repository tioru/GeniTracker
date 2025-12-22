import { User } from "@angular/fire/auth";

export class RMessageClass {
  userName : string | null = null;
  message : string | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : User[] = [];

  constructor(init?:Partial<RMessageClass>) {
    Object.assign(this, init);
  }
}