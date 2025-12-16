import { User } from "@angular/fire/auth";

export class LChatClass {
  userName : string | null = null;
  message : string | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : User[] = [];

  constructor(init?:Partial<LChatClass>) {
    Object.assign(this, init);
  }
}