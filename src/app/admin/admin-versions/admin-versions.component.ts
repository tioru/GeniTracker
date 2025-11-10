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
  public retrievingVersions: boolean = true;

  private database = inject(Database);

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
    endDate: null
  };

  private dbRef = ref(this.database, 'versions');
  
  ngOnInit() {
    this.versionListening();
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

  versionListening() {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.versions = VersionMapper.mapRemoteArray(snapshot.val());
      }
    });
  }

  openVersion(version: ProjectClass.Local.Version) {
    this.selectedVersion = version;
    this.selectedVersionIndex = this.versions.indexOf(version);
    this.openVersionDialogVisibility = true;
  }

  deleteVersion(versionIndex: number) {
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

  createVersion() {
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

  resetNewVersion() {
    this.newVersion = {
      version: '',
      title: '',
      active: false,
      selected: false,
      imgUrl: '',
      startDate: null,
      endDate: null
    };
  }

  saveVersionUpdates() : void {
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

  openDatePicker(event: Event) {
    const input = event.target as HTMLInputElement;
    
    try {
      input.showPicker();
    } catch (error) {
      console.warn('showPicker() not supported or blocked', error);
    }
  }

  openInNewTab(url: string) : void {
    window.open(url, '_blank');
  }
}