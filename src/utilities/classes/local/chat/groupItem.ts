import { User } from "firebase/auth";
import { LMessageClass } from "./message";

export class LGroupItem {
  createdBy: User | null = null;
  messages: { [key: string]: LMessageClass } = {};
  createdAt: string | null = null;
  name: string | null = null;
  description: string | null = null;

  constructor(init?: Partial<LGroupItem>) {
    Object.assign(this, init);
  }
}