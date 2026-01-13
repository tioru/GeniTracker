export class LAttributeScalingClass {
  name : string | null = null;
  value : string | null = null;

  constructor(init?:Partial<LAttributeScalingClass>) {
    Object.assign(this, init);
  }
}