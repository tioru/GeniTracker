import { Component, Input, OnInit } from '@angular/core';
import { DialogComponent, DialogStyle } from '../dialog/dialog.component';
import { NotificationService, notificationSeverity } from '../../../utilities/services/notification.service';
import { AuthService } from '../../../utilities/services/auth.service';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseErrorService } from '../../../utilities/services/firebase-error.service';

enum DialogTab {
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
    
  public selectedDialogTab : DialogTab = DialogTab.CONNEXION;
  
  public currentUser: Observable<User | null> = of(null);

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
    this.authService.register(this.email, this.password).then(() => {
      this.formVisibility = false;
      this.onConnexionCallBack();

      this.email = "";
      this.password="";
    })
  }

  public connexion() {
    this.authService.connexion(this.email, this.password).then(() => {
      this.formVisibility = false;
      this.onConnexionCallBack();

      this.email = "";
      this.password="";
    })
  }
}
