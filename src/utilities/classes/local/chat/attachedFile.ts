export class LAttachedFile {
  id : string | null = null;
  base64 : string | null = null;
  file : File | null = null;

  constructor(init?:Partial<LAttachedFile>) {
    Object.assign(this, init);
  }
}