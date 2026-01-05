import { Component, Input, OnInit } from '@angular/core';
import { DialogComponent, DialogStyle } from '../dialog/dialog.component';
import { NotificationService } from '../../../utilities/services/notification.service';
import { UserService } from '../../../utilities/services/user.service';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseErrorService } from '../../../utilities/services/firebase-error.service';
import { TimelinePointsComponent } from "../timeline-points/timeline-points.component";

enum DialogTab {
  LOGIN,
  REGISTER,
  FORGET_PASSWORD,
  SET_DISPLAY_NAME = 0,
  SET_PROFILE_PICTURE = 1
}

enum PasswordField {
  LOGIN,
  REGISTER
}

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule, TimelinePointsComponent],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent implements OnInit {
  public dialogStyle : typeof DialogStyle = DialogStyle;
  
  public email : string = "";
  
  public password : string = "";
  
  public dialogTab = DialogTab;

  public passwordField = PasswordField;
    
  public selectedDialogTab : DialogTab = DialogTab.LOGIN;

  public selectedFirstConnexionDialogTab : DialogTab = DialogTab.SET_DISPLAY_NAME;
  
  public currentUser: Observable<User | null> = of(null);

  public showRegisterPassword : boolean = false;

  public showLoginPassword : boolean = false;

  public loading : boolean = false;

  public googleLoading : boolean = false;

  public authenticated : boolean = false;

  public displayName : string = "";

  public displayNameDefined : boolean = false;

  public requestLoading : boolean = false;

  public profilePictureLink : string = "";

  public currentProgression = 0;

  @Input() formVisibility : boolean = false;

  @Input() onLoginCallBack : () => void = () => {}

  ngOnInit(): void { 
    this.currentUser = this.userService.currentUser$;
    this.currentUser.subscribe(user => {
      user ? this.authenticated = true : this.authenticated = false;
      this.displayNameDefined = user?.displayName ? true : false;
    });
  }

  constructor(
    public notificationService : NotificationService,
    public userService : UserService,
    public firebaseErrorService: FirebaseErrorService
  ) {}

  public register() {
    this.loading = true;
    this.userService.register(this.email, this.password).then((result) => {
      this.loading = false;
      if (result) {
        this.email = "";
        this.password="";
      }
    })
  }

  public login() {
    this.loading = true;
    this.userService.logIn(this.email, this.password).then((result) => {
      this.loading = false;
      if (result) {
        this.email = "";
        this.password="";
      }
    })
  }

  public togglePasswordVisibility(passwordField : PasswordField) : void {
    let passwordInput : HTMLInputElement;

    if (passwordField === PasswordField.LOGIN) {
      passwordInput = document.querySelector('#connexionPasswordField') as HTMLInputElement;
    } else {
      passwordInput = document.querySelector('#registerPasswordField') as HTMLInputElement;
    }

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      if (passwordField === PasswordField.LOGIN) {
        this.showLoginPassword = true;
      } else {
        this.showRegisterPassword = true;
      }
    } else {
      passwordInput.type = 'password';
      if (passwordField === PasswordField.LOGIN) {
        this.showLoginPassword = false;
      } else {
        this.showRegisterPassword = false;
      }
    }
  }

  public toggleMode() : void {
    this.selectedDialogTab == this.dialogTab.REGISTER ? this.selectedDialogTab = this.dialogTab.LOGIN : this.selectedDialogTab = this.dialogTab.REGISTER
  
    this.email = "";
    this.password = "";
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
  }

  public loginWithGoogle() : void {
    this.googleLoading = true;
    this.userService.loginWithGoogle().then((result) => {
      this.googleLoading = false;
      if (result) {
        this.email = "";
        this.password="";
      }
    })
  }

  public sendPasswordResetEmail() : void {
    this.userService.sendPasswordResetEmail(this.email).then(() => {
      this.selectedDialogTab = this.dialogTab.LOGIN; 
      this.email = ''; 
      this.password = ''
    })
  }

  public saveNewDisplayNameAndProfilePictureLink() : void {
    this.requestLoading = true;
    this.userService.updateUserNameAndProfilePicture(this.displayName, this.profilePictureLink).then((result) => {
      this.requestLoading = false;
      if (result) {
        this.displayNameDefined = true;
        this.displayName = '';
        this.profilePictureLink = '';
        this.userService.duplicateUser()
      }
    });
  }

  public checkDisplayName(event: Event) {
    const inputField = document.querySelector('.input.displayname') as HTMLInputElement;
    const isValid = this.displayName.trim().length > 0;
    const isSubmitEvent = (event instanceof KeyboardEvent && event.code === 'Enter') || 
                          (event instanceof MouseEvent);

    inputField.classList.toggle('error', !isValid);

    if (!isValid && isSubmitEvent) {
      // Wave animation to indicate error
    }

    if (isValid && isSubmitEvent) {
      this.selectedFirstConnexionDialogTab = this.dialogTab.SET_PROFILE_PICTURE;
    }
  }
}
