export class CharacterArtsClass {
    [key: string]: string | null;

    "card" : string | null
    "constellation" : string | null
    "constellation-1" : string | null
    "constellation-2": string | null
    "constellation-3" : string | null
    "constellation-4" : string | null
    "constellation-5" : string | null
    "constellation-6" : string | null
    "constellation-shape" : string | null
    "gacha-card" : string | null
    "gacha-splash" : string | null
    "icon" : string | null
    "icon-big" : string | null
    "icon-side" : string | null
    "namecard-background" : string | null
    "portrait" : string | null
    "talent-burst" : string | null
    "talent-na" : string | null
    "talent-passive-0" : string | null
    "talent-passive-1" : string | null
    "talent-passive-2" : string | null
    "talent-skill" : string | null

    constructor(init?:Partial<CharacterArtsClass> ) {
        Object.assign(this, init);
    }
}