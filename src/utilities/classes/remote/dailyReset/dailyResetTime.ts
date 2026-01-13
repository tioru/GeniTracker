export class RDailyResetTimeClass {
  minute : number | null = null;
  hour : number | null = null;

  constructor(init?:Partial<RDailyResetTimeClass>) {
    Object.assign(this, init);
  }
}