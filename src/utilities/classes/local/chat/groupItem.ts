import { LUserClass } from "../users/user";
import { LMessageClass } from "./message";

export class LGroupItem {
  createdBy: LUserClass | null = null;
  messages: { [key: string]: LMessageClass } = {};
  createdAt: string | null = null;
  name: string | null = null;
  description: string | null = null;
  imgUrl: string | null = null;

  constructor(init?: Partial<LGroupItem>) {
    Object.assign(this, init);
  }
}