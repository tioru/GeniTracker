export class LVersionClass {
  version : string | null = null;
  active : boolean | null = null;
  title : string | null = null;
  selected : boolean | null = null;
  imgUrl : string | null = null;
  startDate : Date | null = null;
  endDate : Date | null = null;
  imgLoaded : boolean = false;

  constructor(init?:Partial<LVersionClass>) {
    Object.assign(this, init);
  }
}