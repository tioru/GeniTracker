import { RMessageClass } from "./message";

export class RGroupItem {
  createdBy: string | null = null;
  messages: { [key: string]: RMessageClass } = {};
  createdAt: string | null = null;
  name: string | null = null;
  description: string | null = null;
  imgUrl: string | null = null;

  constructor(init?: Partial<RGroupItem>) {
    Object.assign(this, init);
  }
}