export class LVersionClass {
  version : string | null = null;
  active : boolean | null = null;
  title : string | null = null;
  selected : boolean | null = null;
  img_url : string | null = null;

  constructor(init?:Partial<LVersionClass>) {
    Object.assign(this, init);
  }
}