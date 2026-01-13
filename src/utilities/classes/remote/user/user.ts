export class RUserClass {
  displayName : string = "";
  email : string | null = null;
  photoURL : string = "";
  signUpDate : string | null = null;
  lastLoginDate : string | null = null;
  uid : string | null = null;

  constructor(init?:Partial<RUserClass>) {
    Object.assign(this, init);
  }
}