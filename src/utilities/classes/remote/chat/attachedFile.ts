export class RAttachedFile {
  id : string | null = null;
  base64 : string | null = null;
  file : File | null = null;

  constructor(init?:Partial<RAttachedFile>) {
    Object.assign(this, init);
  }
}