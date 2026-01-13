export class RConstellationClass {
  name : string | null = null;
  unlock : string | null = null;
  description : string | null = null;
  level : number | null = null;

  constructor(init?:Partial<RConstellationClass>) {
    Object.assign(this, init);
  }
}