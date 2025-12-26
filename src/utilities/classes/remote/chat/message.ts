export class RMessageClass {
  userUID : string | null = null;
  message : string | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : string[] = [];

  constructor(init?:Partial<RMessageClass>) {
    Object.assign(this, init);
  }
}