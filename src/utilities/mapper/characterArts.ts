import { Injectable } from "@angular/core"
import { ProjectClass } from "../classes/class"

@Injectable({
  providedIn: 'root'
})
export class CharacterArtsMapper {
    constructor() {}

    public mapRemoteArray(rCharacterArtsArray : ProjectClass.Remote.CharacterArts[]) : ProjectClass.Local.CharacterArts[] {
        return rCharacterArtsArray.map((rCharacterArts : ProjectClass.Remote.CharacterArts) => {
            return this.mapRemote(rCharacterArts)
        })
    }

    public mapRemote(rCharacterArts : ProjectClass.Remote.CharacterArts) : ProjectClass.Local.CharacterArts {
        return new ProjectClass.Local.CharacterArts({
            card : rCharacterArts.card,
            constellation : rCharacterArts.constellation,
            constellation1 : rCharacterArts["constellation-1"],
            constellation2 : rCharacterArts["constellation-2"],
            constellation3 : rCharacterArts["constellation-3"],
            constellation4 : rCharacterArts["constellation-4"],
            constellation5 : rCharacterArts["constellation-5"],
            constellation6 : rCharacterArts["constellation-6"],
            constellationShape : rCharacterArts["constellation-shape"],
            gachaCard : rCharacterArts["gacha-card"],
            gachaSplash : rCharacterArts["gacha-splash"],
            icon : rCharacterArts.icon,
            iconBig : rCharacterArts["icon-big"],
            iconSide : rCharacterArts["icon-side"],
            namecardBackground : rCharacterArts["namecard-background"],
            portrait : rCharacterArts.portrait,
            talentBurst : rCharacterArts["talent-burst"],
            talentNa : rCharacterArts["talent-na"],
            talentPassive0 : rCharacterArts["talent-passive-0"],
            talentPassive1 : rCharacterArts["talent-passive-1"],
            talentPassive2 : rCharacterArts["talent-passive-2"],
            talentSkill : rCharacterArts["talent-skill"],
        })
    }
}