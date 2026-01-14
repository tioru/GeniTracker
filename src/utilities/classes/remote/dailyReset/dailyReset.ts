export class RDailyResetClass {
  id : string | null = null;
  zone : string | null = null;
  time : string | null = null;

  constructor(init?:Partial<RDailyResetClass>) {
    Object.assign(this, init);
  }
}