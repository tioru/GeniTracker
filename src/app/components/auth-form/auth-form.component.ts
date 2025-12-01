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
  CONNEXION,
  REGISTER,
  FORGET_PASSWORD
}

enum PasswordField {
  CONNEXION,
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
    
  public selectedDialogTab : DialogTab = DialogTab.CONNEXION;
  
  public currentUser: Observable<User | null> = of(null);

  public showRegisterPassword : boolean = false;

  public showConnexionPassword : boolean = false;

  public loading : boolean = false;

  @Input() formVisibility : boolean = false;

  @Input() onConnexionCallBack : () => void = () => {}
      
  ngOnInit(): void { 
    this.currentUser = this.authService.currentUser$;
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
        this.onConnexionCallBack();

        this.email = "";
        this.password="";
      }
    })
  }

  public connexion() {
    this.loading = true;
    this.authService.connexion(this.email, this.password).then((result) => {
      this.loading = false;
      if (result) {
        this.onConnexionCallBack();

        this.email = "";
        this.password="";
      }
    })
  }

  public togglePasswordVisibility(passwordField : PasswordField) : void {
    let passwordInput : HTMLInputElement;

    if (passwordField === PasswordField.CONNEXION) {
      passwordInput = document.querySelector('#connexionPasswordField') as HTMLInputElement;
    } else {
      passwordInput = document.querySelector('#registerPasswordField') as HTMLInputElement;
    }

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      if (passwordField === PasswordField.CONNEXION) {
        this.showConnexionPassword = true;
      } else {
        this.showRegisterPassword = true;
      }
    } else {
      passwordInput.type = 'password';
      if (passwordField === PasswordField.CONNEXION) {
        this.showConnexionPassword = false;
      } else {
        this.showRegisterPassword = false;
      }
    }
  }

  public toggleMode() : void {
    this.selectedDialogTab == this.dialogTab.REGISTER ? this.selectedDialogTab = this.dialogTab.CONNEXION : this.selectedDialogTab = this.dialogTab.REGISTER
  
    this.email = "";
    this.password = "";
    this.showConnexionPassword = false;
    this.showRegisterPassword = false;
  }
}
