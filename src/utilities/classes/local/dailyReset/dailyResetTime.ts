export class LDailyResetTimeClass {
  minute : number | null = null;
  hour : number | null = null;

  constructor(init?:Partial<LDailyResetTimeClass>) {
    Object.assign(this, init);
  }
}