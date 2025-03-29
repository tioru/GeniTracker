export class LPassiveTalentsClass {
  name : string | null = null;
  unlock : string | null = null;
  description : string | null = null;
  level : number | null = null

  constructor(init?:Partial<LPassiveTalentsClass>) {
    Object.assign(this, init);
  }
}