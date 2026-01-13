import { inject, Injectable } from "@angular/core";
import { Database, onValue, ref, Unsubscribe } from "@angular/fire/database";
import { BehaviorSubject } from "rxjs";
import { ProjectClass } from "../classes/class";
import { DailyResetMapper } from "../mapper/dailyReset/dailyReset";

const DAILY_RESET_DB_PATH = "dailyReset";

@Injectable({
  providedIn: 'root'
})
export class DailyResetService {
    private readonly dailiesResetSubject = new BehaviorSubject<ProjectClass.Local.DailyReset[]>([]);
    
    public dailiesReset$ = this.dailiesResetSubject.asObservable();

    private readonly database = inject(Database);

    private dbRef = ref(this.database, DAILY_RESET_DB_PATH);

    private unsubscribeDailyReset?: Unsubscribe;

    constructor(private dailyResetMapper : DailyResetMapper) {

    }

    public dailyResetListening() : void {
        if (this.unsubscribeDailyReset) {
            return;
        }

        this.unsubscribeDailyReset = onValue(this.dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const dailiesReset = Object.values(snapshot.val()).map(dailyReset => this.dailyResetMapper.mapRemote(dailyReset as ProjectClass.Remote.DailyReset));
                this.dailiesResetSubject.next(dailiesReset);
            }
        });
    }

    public getDailiesReset(): ProjectClass.Local.DailyReset[] | null {
        return this.dailiesResetSubject.value;
    }

    public stopDailyResetListening(): void {
        if (this.unsubscribeDailyReset) {
            this.unsubscribeDailyReset();
            this.unsubscribeDailyReset = undefined;
        }
    }
}