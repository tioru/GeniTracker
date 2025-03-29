export class RPassiveTalentsClass {
  name : string | null = null;
  unlock : string | null = null;
  description : string | null = null;
  level : number | null = null;

  constructor(init?:Partial<RPassiveTalentsClass>) {
    Object.assign(this, init);
  }
}