import { User } from "firebase/auth";
import { RMessageClass } from "./message";

export class RGroupItem {
  createdBy: User | null = null;
  messages: { [key: string]: RMessageClass } = {};
  createdAt: string | null = null;
  name: string | null = null;
  description: string | null = null;

  constructor(init?: Partial<RGroupItem>) {
    Object.assign(this, init);
  }
}