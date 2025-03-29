export class LCharacterArtsClass {
    card : string | null = null;
    constellation : string | null = null;
    constellation1 : string | null = null;
    constellation2: string | null = null;
    constellation3 : string | null = null;
    constellation4 : string | null = null;
    constellation5 : string | null = null;
    constellation6 : string | null = null;
    constellationShape : string | null = null;
    gachaCard : string | null = null;
    gachaSplash : string | null = null;
    icon : string | null = null;
    iconBig : string | null = null;
    iconSide : string | null = null;
    namecardBackground : string | null = null;
    portrait : string | null = null;
    talentBurst : string | null = null;
    talentNa : string | null = null;
    talentPassive0 : string | null = null;
    talentPassive1 : string | null = null;
    talentPassive2 : string | null = null;
    talentSkill : string | null = null;

    constructor(init?:Partial<LCharacterArtsClass>) {
        Object.assign(this, init);
    }
}