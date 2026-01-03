export class RAttachedFiles {
  id : string | null = null;
  base64 : string | null = null;
  file : File | null = null;

  constructor(init?:Partial<RAttachedFiles>) {
    Object.assign(this, init);
  }
}