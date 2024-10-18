export class UpgradeClass {
    "name" : string
    "value" : string

    constructor(init?:Partial<UpgradeClass> ) {
        Object.assign(this, init);
      }
}