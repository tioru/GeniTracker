import { Component, Input } from '@angular/core';
import { DialogComponent, DialogStyle } from '../dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../utilities/services/user.service';
import { NotificationService, notificationSeverity } from '../../../utilities/services/notification.service';
import { FirebaseErrorService } from '../../../utilities/services/firebase-error.service';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [CommonModule, DialogComponent, FormsModule],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.scss'
})
export class ResetPasswordFormComponent {
  public dialogStyle : typeof DialogStyle = DialogStyle;

  public newPassword : string = '';

  public confirmNewPassword : string = '';

  @Input() resetPasswordVisibility : boolean = false;

  @Input() oobCode : string | null = null;
  
  @Input() onResetCallBack : () => void = () => {}

  constructor(
    public userService : UserService,
    public notificationService : NotificationService,
    public firebaseErrorService : FirebaseErrorService
  ) {}

  public confirmPasswordReset() : void {
    if (this.oobCode) {
      this.userService.confirmPasswordReset(this.oobCode, this.newPassword).then(() => {
        this.notificationService.addNotification({
          title: 'Modification réussie',
          severity: notificationSeverity.OK,
          detail: `Modification du mot de passe réussie`,
          sticky: false,
          delay: 5000
        });
        this.onResetCallBack();
      }).catch((error) => {
        this.notificationService.addNotification({
          title: 'Erreur',
          severity: notificationSeverity.ERROR,
          detail: this.firebaseErrorService.handleFirebaseError(error),
          sticky: true
        });
      })
    }
  }

  get isPasswordsIdentical() : boolean {
    return this.newPassword === this.confirmNewPassword;
  }

  get isPasswordEmpty() : boolean {
    return this.newPassword.length == 0;
  }
}
