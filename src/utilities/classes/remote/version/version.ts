export class RVersionClass {
  version : string | null = null;
  current_version : boolean | null = null;
  title : string | null = null;
  img_url : string | null = null;
  start_date : Date | null = null;
  end_date : Date | null = null;

  constructor(init?:Partial<RVersionClass>) {
    Object.assign(this, init);
  }
}