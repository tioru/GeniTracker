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

  public updateVersionDialogVisibility: boolean = false;

  public selectedVersion: ProjectClass.Local.Version | null = null;

  public dialogStyle : typeof DialogStyle = DialogStyle;

  public newVersion: ProjectClass.Local.Version = {
    version: '',
    title: '',
    active: false,
    selected: false,
    img_url: ''
  };

  private dbRef = ref(this.database, 'versions');
  
  ngOnInit() {
    this.versionListening();
  }

  constructor(
    public notificationService : NotificationService
  ) {}

  get isNewVersionCompleted() : boolean {
    return this.newVersion.version !== '' && this.newVersion.title !== '' && this.newVersion.img_url !== '';
  }

  versionListening() {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.versions = VersionMapper.mapRemoteArray(snapshot.val());
      }
    });
  }

  updateVersion(version: ProjectClass.Local.Version) {
    console.log(`Modifier la version: ${version}`);
    this.selectedVersion = version;
    this.updateVersionDialogVisibility = true;
  }

  deleteVersion(version: ProjectClass.Local.Version) {
    console.log(`Supprimer la version : ${version}`);
    // Logique pour supprimer la version
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
      img_url: ''
    };
  }
}