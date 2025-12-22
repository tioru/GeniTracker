import { LGroupItem } from "./groupItem";

export class LGroupClass {
  string: { [key: string]: LGroupItem } = {};

  constructor(init?: Partial<LGroupClass>) {
    Object.assign(this, init);
  }
}