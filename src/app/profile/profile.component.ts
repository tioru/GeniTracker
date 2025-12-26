import { Component, OnInit } from '@angular/core';
import { ImageCacheService } from '../../utilities/services/image-cache.service';
import { UserService } from '../../utilities/services/user.service';
import { Router } from '@angular/router';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';
import { ProjectClass } from '../../utilities/classes/class';
import { CommonModule } from '@angular/common';
import { animations } from '../animation';
import { DialogComponent, DialogStyle } from '../components/dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { TooltipComponent } from "../components/tooltip/tooltip.component";
import { skip } from 'rxjs';

export enum PROVIDER_DATA_TYPE {
  PASSWORD = "password",
  GOOGLE = "google.com"
}

const MIN_LANDSCAPE_NUMBER = 1;
const MAX_LANDSCAPE_NUMBER = 6;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule, TooltipComponent],
  templateUrl: './profile.component.html',
  animations: animations,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  public dialogStyle : typeof DialogStyle = DialogStyle;

  public profilPictureLoading : boolean = true;

  public providerDataType : typeof PROVIDER_DATA_TYPE = PROVIDER_DATA_TYPE;

  public currentCustomUser : ProjectClass.Local.User | null = null;

  public userDisplayName : string | null = null;

  public userMail : string | null = null;

  public userPassword : string = "";

  public userProfilePictureLink : string | null = null;

  public displayNameDialogUpdate : boolean = false;

  public mailDialogUpdate : boolean = false;

  public passwordDialogUpdate : boolean = false;

  public profilePictureLinkDialogUpdate : boolean = false;

  public updateFinished : boolean = false;

  public loadingProfileDialogVisibility : boolean = true;

  public randomPicturePath : string = '';

  constructor(
    public imageCacheService : ImageCacheService, 
    public userService : UserService, 
    public router: Router,
    public notificationService : NotificationService
  ) {}

  ngOnInit() {
    this.randomPicturePath = this.getRandomPicture();
    
    this.userService.currentUser$.pipe(skip(1)).subscribe(() => {
      if (!this.userService.currentUserValue) {
        this.router.navigateByUrl("/")
        this.notificationService.addNotification({
          title: 'Accès refusé',
          severity: notificationSeverity.WARNING,
          detail: 'La page que vous avez essayé d\'accéder requiert une connexion',
          sticky: true
        })
      } else {
        this.defineCustomUser();
      }
    });
    this.defineCustomUser();
  }

  public closeList() : void {
    const popover = document.getElementById("openEditList");
    
    if (popover) {
      popover.hidePopover()
    }
  }

  public defineCustomUser() : void {
    if (this.userService.currentUserValue) {
      this.userDisplayName = JSON.parse(JSON.stringify(this.userService.currentUserValue.displayName));
      this.userMail = JSON.parse(JSON.stringify(this.userService.currentUserValue.email));
      this.userProfilePictureLink = JSON.parse(JSON.stringify(this.userService.currentUserValue.photoURL));
      this.userService.getUserByUID(this.userService.currentUserValue.uid).then((customUser) => {
        this.currentCustomUser = customUser;
      })
    }
  }

  public checkDisplayName(event: Event) : void {
    const inputField = document.querySelector('.input.displayname') as HTMLInputElement;
    const isValid = this.userDisplayName!.trim().length > 0;
    const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                          (event instanceof MouseEvent);

    inputField.classList.toggle('error', !isValid);

    if (!isValid && isSubmitEvent) {
      // Wave animation to indicate error
    }

    if (isValid && isSubmitEvent) {
      this.userService.updateUserName(this.userDisplayName!).then((result) => {
        if (result) {
          this.updateFinished = true;
        }
      })
    }
  }

  public checkEmail(event: Event) : void {
    const inputField = document.querySelector('.input.email') as HTMLInputElement;
    const isValid = this.userMail!.trim().length > 0;
    const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                          (event instanceof MouseEvent);

    inputField.classList.toggle('error', !isValid);

    if (!isValid && isSubmitEvent) {
      // Wave animation to indicate error
    }

    if (isValid && isSubmitEvent) {
      this.userService.updateEmail(this.userMail!).then((result) => {
        if (result) {
          this.updateFinished = true;
        }
      })
    }
  }

  public checkPassword(event: Event) : void {
    const inputField = document.querySelector('.input.password') as HTMLInputElement;
    const isValid = this.userPassword.trim().length > 0;
    const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                          (event instanceof MouseEvent);

    inputField.classList.toggle('error', !isValid);

    if (!isValid && isSubmitEvent) {
      // Wave animation to indicate error
    }

    if (isValid && isSubmitEvent) {
      this.userService.updatePassword(this.userPassword).then((result) => {
        if (result) {
          this.updateFinished = true;
        }
      })
    }
  }

  public checkProfilePictureLink(event: Event) : void {
    if (this.currentCustomUser) {
      const inputField = document.querySelector('.input.password') as HTMLInputElement;
      const isValid = this.userProfilePictureLink!.trim().length > 0;
      const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                            (event instanceof MouseEvent);

      inputField.classList.toggle('error', !isValid);

      if (!isValid && isSubmitEvent) {
        // Wave animation to indicate error
      }

      if (isValid && isSubmitEvent) {
        this.userService.updateProfilePicture(this.userProfilePictureLink!).then((result) => {
          if (result) {
            this.updateFinished = true;
          }
        })
      }
    }
  }

  public getRandomPicture() : string {
    const randomNumber = Math.floor(Math.random() * (MAX_LANDSCAPE_NUMBER - MIN_LANDSCAPE_NUMBER + 1)) + MIN_LANDSCAPE_NUMBER;
    return `assets/img/Landscape/${randomNumber}.jpg`
  }
}
