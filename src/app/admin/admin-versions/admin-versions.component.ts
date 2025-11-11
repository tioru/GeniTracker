import { Component, inject } from '@angular/core';
import { Database, onValue, ref, set } from '@angular/fire/database';
import { ProjectClass } from '../../../utilities/classes/class';
import { VersionMapper } from '../../../utilities/mapper/version';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent, DialogStyle } from '../../components/dialog/dialog.component';
import { NotificationService, notificationSeverity } from '../../../utilities/services/notification.service';

@Component({
  selector: 'app-admin-versions',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './admin-versions.component.html',
  styleUrl: './admin-versions.component.scss'
})
export class AdminVersionsComponent {
  private database = inject(Database);
  
  private dbRef = ref(this.database, 'versions');

  public versions: ProjectClass.Local.Version[] = [];

  public addVersionDialogVisibility: boolean = false;

  public openVersionDialogVisibility: boolean = false;

  public selectedVersionIndex: number | null = null;

  public selectedVersion: ProjectClass.Local.Version | null = null;

  public dialogStyle : typeof DialogStyle = DialogStyle;

  public editModeEnabled : boolean = false;

  public newVersion: ProjectClass.Local.Version = {
    version: '',
    title: '',
    active: false,
    selected: false,
    imgUrl: '',
    startDate: null,
    endDate: null,
    imgLoaded: false
  };

  public majorVersions : { [key: string]: ProjectClass.Local.Version[] } = {};

  public majorVersionRegex : RegExp = /^([^.\s]+)/;

  ngOnInit() {
    this.versionListening()
  }

  async ngAfterViewInit() : Promise<void> {
    await this.versionInitializing().then(() => {
      this.sortVersion();
    });
  }

  constructor(
    public notificationService : NotificationService
  ) {}

  get isNewVersionCompleted() : boolean {
    return !!this.newVersion.version && !!this.newVersion.title && !!this.newVersion.imgUrl && !!this.newVersion.startDate;
  }

  get currentDate() : Date {
    return new Date();
  }

  public versionListening() : void {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.versions = VersionMapper.mapRemoteArray(snapshot.val());
        console.log(this.versions)
      }
    });
  }

  private async versionInitializing() : Promise<void> {
    return new Promise((resolve) => {
      const dbRef = ref(this.database, 'versions');
      
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          this.versions = VersionMapper.mapRemoteArray(snapshot.val());
        }
        resolve();
      });
    });
  }

  public openVersion(version: ProjectClass.Local.Version) : void {
    this.selectedVersion = version;
    this.selectedVersionIndex = this.versions.indexOf(version);
    this.openVersionDialogVisibility = true;
  }

  public deleteVersion(versionIndex: number) : void {
    const newVersionsArray = [...this.versions];
    newVersionsArray.splice(versionIndex, 1);
    set(this.dbRef, VersionMapper.mapLocalArray(newVersionsArray)).then(() => {
      this.notificationService.addNotification({
        title: 'Succès',
        severity: notificationSeverity.OK,
        detail: 'La version a été supprimée avec succès.',
        sticky: false,
        delay: 5000
      });
      this.openVersionDialogVisibility = false;
      this.selectedVersionIndex = null;
      this.selectedVersion = null;
      this.editModeEnabled = false;
    }, (error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Échec de la suppression de la version : ${error}`,
        sticky: true,
      });
    });
  }

  public createVersion() : void {
    const newVersionsArray = [...this.versions, this.newVersion];
    set(this.dbRef, VersionMapper.mapLocalArray(newVersionsArray)).then(() => {
      this.notificationService.addNotification({
        title: 'Succès',
        severity: notificationSeverity.OK,
        detail: 'La version a été créée avec succès.',
        sticky: false,
        delay: 5000
      });
      this.addVersionDialogVisibility = false;
      this.resetNewVersion();
    }, (error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Échec de la création de la version : ${error}`,
        sticky: true,
      });
    });
  }

  public resetNewVersion() : void {
    this.newVersion = {
      version: '',
      title: '',
      active: false,
      selected: false,
      imgUrl: '',
      startDate: null,
      endDate: null,
      imgLoaded: false
    };
  }

  public saveVersionUpdates() : void {
    const newVersionsArray = [...this.versions];
    if (this.selectedVersionIndex !== null && this.selectedVersion) {
      newVersionsArray[this.selectedVersionIndex] = this.selectedVersion;
    }
    set(this.dbRef, VersionMapper.mapLocalArray(newVersionsArray)).then(() => {
      this.notificationService.addNotification({
        title: 'Succès',
        severity: notificationSeverity.OK,
        detail: 'Mise à jour réalisée avec succès.',
        sticky: false,
        delay: 5000
      });
      this.openVersionDialogVisibility = false;
      this.selectedVersionIndex = null;
      this.selectedVersion = null;
      this.editModeEnabled = false;
    }, (error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Échec lors de la mise à jour : ${error}`,
        sticky: true,
      });
    });
  }

  public openDatePicker(event: Event) : void {
    const input = event.target as HTMLInputElement;
    
    try {
      input.showPicker();
    } catch (error) {
      console.warn('showPicker() not supported or blocked', error);
    }
  }

  public openInNewTab(url: string) : void {
    window.open(url, '_blank');
  }

  public sortVersion() : void {
    this.versions.map(v => {
      if (v.version)  {
        const result = v.version.match(this.majorVersionRegex)
        if (result){
          this.majorVersions[result[0]] = [...this.majorVersions[result[0]] || [], v];
        }
      }
    })
  }

  public isADate(date : Date | null) : boolean {
    try {
      if (date === null) return false;
      date.getTime();
      return true
    } catch {
      return false;
    }
  }
}