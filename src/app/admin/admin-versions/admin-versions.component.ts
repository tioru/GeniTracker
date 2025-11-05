import { Component, inject } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { ProjectClass } from '../../../utilities/classes/class';
import { VersionMapper } from '../../../utilities/mapper/version';

@Component({
  selector: 'app-admin-versions',
  standalone: true,
  imports: [],
  templateUrl: './admin-versions.component.html',
  styleUrl: './admin-versions.component.scss'
})
export class AdminVersionsComponent {
  public retrievingVersions: boolean = true;

  private database = inject(Database);

  public versions: ProjectClass.Local.Version[] = [];

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
}
