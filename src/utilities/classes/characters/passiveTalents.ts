export class PassiveTalentsClass {
  "name" : string
  "unlock" : string
  "description" : string
  "level" : number | null = null

  constructor(init?:Partial<PassiveTalentsClass> ) {
      Object.assign(this, init);
    }
}