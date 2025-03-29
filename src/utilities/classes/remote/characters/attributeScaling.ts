export class RAttributeScalingClass {
  name : string | null = null;
  value : string | null = null;

  constructor(init?:Partial<RAttributeScalingClass>) {
    Object.assign(this, init);
  }
}