import { LDailyResetTimeClass } from "./dailyResetTime";

export class LDailyResetClass {
  id : string | null = null;
  zone : string | null = null;
  time : LDailyResetTimeClass | null = null;

  constructor(init?:Partial<LDailyResetClass>) {
    Object.assign(this, init);
  }
}