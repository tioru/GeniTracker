import { Component, inject } from '@angular/core';
import { Database, onValue, ref, set } from '@angular/fire/database';
import { ProjectClass } from '../../../utilities/classes/class';
import { VersionMapper } from '../../../utilities/mapper/version';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent, DialogStyle } from '../../components/dialog/dialog.component';
import { NotificationService, notificationSeverity } from '../../../utilities/services/notification.service';
import { animations } from '../../animation';
import { FirebaseErrorService } from '../../../utilities/services/firebase-error.service';
import { ImageCacheService } from '../../../utilities/services/image-cache.service';
import { TooltipComponent } from "../../components/tooltip/tooltip.component";
import { OverflowTooltipDirective } from '../../../utilities/directives/overflowTooltip';

@Component({
  selector: 'app-admin-versions',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent, TooltipComponent, OverflowTooltipDirective],
  templateUrl: './admin-versions.component.html',
  styleUrls: ['./admin-versions.component.scss'],
  animations: animations
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

  public updtdImgSrc : string = "";

  public versionCreated : boolean = false;
  
  public versionEdited : boolean = false;

  ngOnInit() {
    this.versionListening()
  }

  async ngAfterViewInit(): Promise<void> {
    await this.versionInitializing().then(() => {
      this.sortVersion();
      this.preloadImages();
    });
  }

  constructor(
    public notificationService : NotificationService,
    public firebaseErrorService: FirebaseErrorService,
    public imageCacheService : ImageCacheService
  ) {}

  get isNewVersionCompleted() : boolean {
    return !!this.newVersion.version && !!this.newVersion.title && !!this.newVersion.imgUrl && !!this.newVersion.startDate;
  }

  get currentDate() : Date {
    return new Date();
  }

  private preloadImages(): void {
    this.versions.forEach(version => {
      if (version.imgUrl && !this.imageCacheService.imageObjectUrls.has(version.imgUrl)) {
        this.imageCacheService.loadImage(version.imgUrl).subscribe(objectUrl => {
          this.imageCacheService.imageObjectUrls.set(version.imgUrl!, objectUrl);
          version.imgLoaded = true;
        });
      }
    });
  }

  public versionListening() : void {
    onValue(this.dbRef, (snapshot) => {
      if (snapshot.exists()) {
        this.versions = VersionMapper.mapRemoteArray(snapshot.val());
        this.sortVersion();
        this.preloadImages();
      }
    });
  }

  private async versionInitializing() : Promise<void> {
    return new Promise((resolve) => {      
      onValue(this.dbRef, (snapshot) => {
        if (snapshot.exists()) {
          this.versions = VersionMapper.mapRemoteArray(snapshot.val());
        }
        resolve();
      });
    });
  }

  public openVersion(version: ProjectClass.Local.Version) : void {
    this.selectedVersion = {...version};
    this.selectedVersionIndex = this.versions.findIndex(v => v.version === version.version);
    this.openVersionDialogVisibility = true;
    if(this.selectedVersion.imgUrl) {
      this.updtdImgSrc = this.selectedVersion.imgUrl;
    }
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
      this.versionEdited = true;
    }, (error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Échec de la suppression de la version : ${this.firebaseErrorService.handleFirebaseError(error)}`,
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
      this.versionCreated = true;
      this.resetNewVersion();
    }, (error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Échec de la création de la version : ${this.firebaseErrorService.handleFirebaseError(error)}`,
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
      newVersionsArray[this.selectedVersionIndex].imgUrl = this.updtdImgSrc;
    }
    set(this.dbRef, VersionMapper.mapLocalArray(newVersionsArray)).then(() => {
      this.notificationService.addNotification({
        title: 'Succès',
        severity: notificationSeverity.OK,
        detail: 'Mise à jour réalisée avec succès.',
        sticky: false,
        delay: 5000
      });
      this.versionEdited = true;
    }, (error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: `Échec lors de la mise à jour : ${this.firebaseErrorService.handleFirebaseError(error)}`,
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
    this.majorVersions = {}

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
    if (date!!) {
      try {
        const dateFormat = new Date(date);
        dateFormat.getTime();
        return true
      } catch {
        return false;
      }
    }
    return false
  }

  public closePopup() : void {
    const popover = document.getElementById("confirmPopup");
    
    if (popover) {
      popover.hidePopover()
    }
  }

  ngOnDestroy(): void {
    this.imageCacheService.imageObjectUrls.forEach(url => URL.revokeObjectURL(url));
    this.imageCacheService.imageObjectUrls.clear();
  }
}