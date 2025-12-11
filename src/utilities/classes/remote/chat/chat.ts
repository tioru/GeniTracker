import { User } from "@angular/fire/auth";

export class RChatClass {
  user : User | null = null;
  message : boolean | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : User[] = [];

  constructor(init?:Partial<RChatClass>) {
    Object.assign(this, init);
  }
}