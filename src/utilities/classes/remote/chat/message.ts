export class RMessageClass {
  userUID : string | null = null;
  message : string | null = null;
  date : string | null = null;
  modified : boolean | null = null;
  seenBy : string[] = [];
  id : string | null = null;

  constructor(init?:Partial<RMessageClass>) {
    Object.assign(this, init);
  }
}