export class RCharacterArtsClass {
    card : string | null = null;
    constellation : string | null = null;
    "constellation-1" : string | null = null;
    "constellation-2": string | null = null;
    "constellation-3" : string | null = null;
    "constellation-4" : string | null = null;
    "constellation-5" : string | null = null;
    "constellation-6" : string | null = null;
    "constellation-shape" : string | null = null;
    "gacha-card" : string | null = null;
    "gacha-splash" : string | null = null;
    icon : string | null = null;
    "icon-big" : string | null = null;
    "icon-side" : string | null = null;
    "namecard-background" : string | null = null;
    portrait : string | null = null;
    "talent-burst" : string | null = null;
    "talent-na" : string | null = null;
    "talent-passive-0" : string | null = null;
    "talent-passive-1" : string | null = null;
    "talent-passive-2" : string | null = null;
    "talent-skill" : string | null = null;

    constructor(init?:Partial<RCharacterArtsClass> ) {
        Object.assign(this, init);
    }
}