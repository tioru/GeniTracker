import { Injectable } from "@angular/core";
import { ProjectClass } from "../../classes/class";

@Injectable({
  providedIn: 'root'
})
export class DailyResetTimeMapper {
    constructor() {}

    public mapRemote(rDailyResetTime : ProjectClass.Remote.DailyResetTime) : ProjectClass.Local.DailyResetTime {
        try {
            return new ProjectClass.Local.DailyResetTime({
                hour: rDailyResetTime.hour,
                minute: rDailyResetTime.minute
            })
        } catch (error) {
            throw new Error("Error mapping Remote DailyResetTime to Local DailyResetTime: " + error);
        }
    }

    public mapLocal(lDailyResetTime : ProjectClass.Local.DailyResetTime) : ProjectClass.Remote.DailyResetTime {
        try {
            return new ProjectClass.Remote.DailyResetTime({
                hour: lDailyResetTime.hour,
                minute: lDailyResetTime.minute
            })
        } catch (error) {
            throw new Error("Error mapping Local DailyResetTime to Remote DailyResetTime: " + error);
        }
    }
}