import { inject, Injectable } from "@angular/core";
import { Database, onValue, push, ref } from "@angular/fire/database";
import { ProjectClass } from "../classes/class";
import { GroupMapper } from "../mapper/group";
import { BehaviorSubject } from "rxjs";

const DEFAULT_GROUP_NAME = "Général";

const ERROR_GROUP_CREATION_FAILED = 'Group creation failed';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
    private database = inject(Database);
    private readonly groupRef = ref(this.database, 'groups');

    private groupsSubject = new BehaviorSubject<{ [key: string]: ProjectClass.Local.GroupItem }>({});
    public groups$ = this.groupsSubject.asObservable();
    
    private selectedGroupKeySubject = new BehaviorSubject<string | null>(null);
    public selectedGroupKey$ = this.selectedGroupKeySubject.asObservable();

    constructor(
        public groupMapper : GroupMapper
    ) { }

    public startListening(): void {
        onValue(this.groupRef, async (snapshot) => {
            if (snapshot.exists()) {
                const groups = await this.groupMapper.mapRemoteDict(snapshot.val());
                this.groupsSubject.next(groups);
                
                if (!this.selectedGroupKeySubject.value) {
                    this.autoSelectGroup(groups);
                }
            }
        });
    }

    private autoSelectGroup(groups: { [key: string]: ProjectClass.Local.GroupItem }): void {
        const defaultGroupKey = Object.keys(groups).find(
            key => groups[key].name === DEFAULT_GROUP_NAME
        );
        
        if (defaultGroupKey) {
            this.setSelectedGroupKey(defaultGroupKey);
        } else {
            const firstGroupKey = Object.keys(groups)[0];
            if (firstGroupKey) {
                this.setSelectedGroupKey(firstGroupKey);
            }
        }
    }

    public setSelectedGroupKey(groupKey: string | null): void {
        this.selectedGroupKeySubject.next(groupKey);
    }

    public getSelectedGroupKey(): string | null {
        return this.selectedGroupKeySubject.value;
    }

    public getGroups(): { [key: string]: ProjectClass.Local.GroupItem } {
        return this.groupsSubject.value;
    }


    public async createGroup(newGroup : ProjectClass.Local.GroupItem): Promise<void> {
        try {
            await push(this.groupRef, this.groupMapper.mapLocalItem(newGroup))
        } catch(error) {
            throw new Error(error instanceof Error ? error.message : ERROR_GROUP_CREATION_FAILED);
        }
    }
}