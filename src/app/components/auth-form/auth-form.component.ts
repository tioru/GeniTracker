import { Component, Input, OnInit } from '@angular/core';
import { DialogComponent, DialogStyle } from '../dialog/dialog.component';
import { NotificationService, notificationSeverity } from '../../../utilities/services/notification.service';
import { UserService } from '../../../utilities/services/user.service';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseErrorService } from '../../../utilities/services/firebase-error.service';

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
  imports: [CommonModule, DialogComponent, FormsModule],
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

  public basicLoginInProgress : boolean = false;

  public googleLoginInProgress : boolean = false;

  public forgetPasswordMailSendingInProgress : boolean = false;

  public authenticated : boolean = false;

  @Input() formVisibility : boolean = false;

  @Input() onLoginCallBack : () => void = () => {}

  ngOnInit(): void { 
    this.currentUser = this.userService.currentUser$;
    this.currentUser.subscribe(user => {
      user ? this.authenticated = true : this.authenticated = false;
    });
  }

  constructor(
    public notificationService : NotificationService,
    public userService : UserService,
    public firebaseErrorService: FirebaseErrorService
  ) {}

  public login() {
    this.basicLoginInProgress = true;
    this.userService.logIn(this.email, this.password).then(() => {
      this.email = "";
      this.password="";
      if (this.userService.currentUserValue) {
        this.notificationService.addNotification({
          title: 'Connecté',
          severity: notificationSeverity.OK,
          detail: `Bienvenue ${this.userService.currentUserValue.displayName ? this.userService.currentUserValue.displayName : this.userService.currentUserValue.email}`,
          sticky: false,
          delay: 5000
        });
      }
    }).catch((error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }).finally(() => {
      this.basicLoginInProgress = false;
    })
  }

  public loginWithGoogle() : void {
    this.googleLoginInProgress = true;
    this.userService.loginWithGoogle().then(() => {
      this.email = "";
      this.password="";
      if (this.userService.currentUserValue) {
        this.notificationService.addNotification({
          title: 'Connecté',
          severity: notificationSeverity.OK,
          detail: `Bienvenue ${this.userService.currentUserValue.displayName}`,
          sticky: false,
          delay: 5000
        });
      }
    }).catch((error : any) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }).then(() => {
      this.googleLoginInProgress = false;
    })
  }

  public register() {
    this.basicLoginInProgress = true;
    this.userService.register(this.email, this.password).then(() => {
      this.email = "";
      this.password="";
      if (this.userService.currentUserValue) {
        this.notificationService.addNotification({
          title: 'Connecté',
          severity: notificationSeverity.OK,
          detail: `Bienvenue ${this.userService.currentUserValue.email}`,
          sticky: false,
          delay: 5000
        });
      }
    }).catch((error) => {
      this.notificationService.addNotification({
        title: 'Erreur lors de l\'enregistrement',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }).finally(() => {
      this.basicLoginInProgress = false;
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

  public sendPasswordResetEmail() : void {
    this.forgetPasswordMailSendingInProgress = true;
    this.userService.sendPasswordResetEmail(this.email).then(() => {
      this.selectedDialogTab = this.dialogTab.LOGIN; 
      this.email = ''; 
      this.password = '';
      this.notificationService.addNotification({
        title: 'Connecté',
        severity: notificationSeverity.OK,
        detail: `Email de réinitialisation de mot de passe envoyé`,
        sticky: false,
        delay: 5000
      });
    }).catch((error) => {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }).then(() => {
      this.forgetPasswordMailSendingInProgress = false;
    })
  }
}
