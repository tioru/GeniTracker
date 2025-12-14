import { Component, Input, OnInit } from '@angular/core';
import { DialogComponent, DialogStyle } from '../dialog/dialog.component';
import { NotificationService } from '../../../utilities/services/notification.service';
import { AuthService } from '../../../utilities/services/auth.service';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseErrorService } from '../../../utilities/services/firebase-error.service';

enum DialogTab {
  LOGIN,
  REGISTER,
  FORGET_PASSWORD
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
  
  public currentUser: Observable<User | null> = of(null);

  public showRegisterPassword : boolean = false;

  public showLoginPassword : boolean = false;

  public loading : boolean = false;

  public googleLoading : boolean = false;

  public authenticated : boolean = false;

  @Input() formVisibility : boolean = false;

  @Input() onLoginCallBack : () => void = () => {}

  ngOnInit(): void { 
    this.currentUser = this.authService.currentUser$;
    this.currentUser.subscribe(user => {
      user ? this.authenticated = true : this.authenticated = false;
    });
  }

  constructor(
    public notificationService : NotificationService,
    public authService : AuthService,
    public firebaseErrorService: FirebaseErrorService
  ) {}

  public register() {
    this.loading = true;
    this.authService.register(this.email, this.password).then((result) => {
      this.loading = false;
      if (result) {
        this.email = "";
        this.password="";
      }
    })
  }

  public login() {
    this.loading = true;
    this.authService.login(this.email, this.password).then((result) => {
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
    this.authService.loginWithGoogle().then((result) => {
      this.googleLoading = false;
      if (result) {
        this.email = "";
        this.password="";
      }
    })
  }

  public sendPasswordResetEmail() : void {
    this.authService.sendPasswordResetEmail(this.email).then(() => {
      this.selectedDialogTab = this.dialogTab.LOGIN; 
      this.email = ''; 
      this.password = ''
    })
  }
}
