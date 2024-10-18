export class AttributeScalingClass {
    "name" : string
    "value" : string

    constructor(init?:Partial<AttributeScalingClass> ) {
        Object.assign(this, init);
      }
}