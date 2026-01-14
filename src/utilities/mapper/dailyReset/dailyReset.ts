import { Injectable } from "@angular/core";
import { ProjectClass } from "../../classes/class";

@Injectable({
  providedIn: 'root'
})
export class DailyResetMapper {
    constructor() {}

    public mapRemoteArray(rDailiesReset : ProjectClass.Remote.DailyReset[]) : ProjectClass.Local.DailyReset[] {
        try {
            return rDailiesReset.map(rDailyReset => this.mapRemote(rDailyReset));
        } catch (error) {
            throw new Error("Error mapping Remote DailyReset Array to Local DailyReset Array: " + error);
        }
    }

    public mapRemote(rDailyReset : ProjectClass.Remote.DailyReset): ProjectClass.Local.DailyReset {
        try {
            return new ProjectClass.Local.DailyReset({
                id: rDailyReset.id,
                time: rDailyReset.time ? new Date(rDailyReset.time) : null,
                zone: rDailyReset.zone
            })
        } catch (error) {
            throw new Error("Error mapping Remote DailyReset to Local DailyReset: " + error);
        }
    }

    public mapLocalArray(lDailiesReset : ProjectClass.Local.DailyReset[]) : ProjectClass.Remote.DailyReset[] {
        try {
            return lDailiesReset.map(lDailyReset => this.mapLocal(lDailyReset));
        } catch (error) {
            throw new Error("Error mapping Local DailyReset Array to Remote DailyReset Array: " + error);
        }
    }

    public mapLocal(rDailyReset : ProjectClass.Local.DailyReset): ProjectClass.Remote.DailyReset {
        try {
            return new ProjectClass.Remote.DailyReset({
                id: rDailyReset.id,
                time: rDailyReset.time ? rDailyReset.time.toISOString() : null,
                zone: rDailyReset.zone
            })
        } catch (error) {
            throw new Error("Error mapping Local DailyReset to Remote DailyReset: " + error);
        }
    }
}