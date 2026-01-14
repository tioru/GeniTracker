export class LDailyResetClass {
  id : string | null = null;
  zone : string | null = null;
  time : Date | null = null;

  constructor(init?:Partial<LDailyResetClass>) {
    Object.assign(this, init);
  }
}