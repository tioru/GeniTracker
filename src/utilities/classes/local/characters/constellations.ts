export class LConstellationClass {
  name : string | null = null;
  unlock : string | null = null;
  description : string | null = null;
  level : number | null = null;

  constructor(init?:Partial<LConstellationClass>) {
    Object.assign(this, init);
  }
}