import { RGroupItem } from "./groupItem";

export class RGroupClass {
  string: { [key: string]: RGroupItem } = {};

  constructor(init?: Partial<RGroupClass>) {
    Object.assign(this, init);
  }
}