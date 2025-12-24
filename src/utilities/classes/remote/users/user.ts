export class RUserClass {
  displayName : string | null = null;
  email : string | null = null;
  photoURL : string | null = null;
  signUpDate : string | null = null;

  constructor(init?:Partial<RUserClass>) {
    Object.assign(this, init);
  }
}