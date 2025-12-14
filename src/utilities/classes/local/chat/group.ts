import { User } from "@angular/fire/auth";
import { LChatClass } from "./chat";

export class LGroupClass {
  name: string | null = null;
  createdBy : User | null = null;
  messages : LChatClass[] = [];
  createdAt : string | null = null;

  constructor(init?:Partial<LGroupClass>) {
    Object.assign(this, init);
  }
}