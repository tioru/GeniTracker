import { User } from "@angular/fire/auth";
import { RChatClass } from "./chat";

export class RGroupClass {
  name: string | null = null;
  createdBy : User | null = null;
  messages : RChatClass[] = [];
  createdAt : string | null = null;

  constructor(init?:Partial<RGroupClass>) {
    Object.assign(this, init);
  }
}