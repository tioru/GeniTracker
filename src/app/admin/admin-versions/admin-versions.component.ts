import { Component, inject } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { ProjectClass } from '../../../utilities/classes/class';
import { VersionMapper } from '../../../utilities/mapper/version';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent, DialogStyle } from '../../components/dialog/dialog.component';

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

  versionListening() {
    const dbRef = ref(this.database, 'version');
    
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.versions = VersionMapper.mapRemoteArray(snapshot.val());
        console.log('Données mises à jour:', this.versions);
      }
    });
  }

  ngOnInit() {
    this.versionListening();
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
    console.log('Créer une nouvelle version:', this.newVersion);
    // Logique pour créer une nouvelle version
  }
}
