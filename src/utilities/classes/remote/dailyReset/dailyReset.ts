import { RDailyResetTimeClass } from "./dailyResetTime";

export class RDailyResetClass {
  id : string | null = null;
  zone : string | null = null;
  time : RDailyResetTimeClass | null = null;

  constructor(init?:Partial<RDailyResetClass>) {
    Object.assign(this, init);
  }
}