export class LUserClass {
  displayName : string | null = null;
  email : string | null = null;
  photoURL : string | null = null;
  signUpDate : Date | null = null;
  lastLoginDate : Date | null = null;
  uid : string | null = null;

  constructor(init?:Partial<LUserClass>) {
    Object.assign(this, init);
  }
}