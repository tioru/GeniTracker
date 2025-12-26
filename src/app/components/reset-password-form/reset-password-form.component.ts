import { Component, Input } from '@angular/core';
import { DialogComponent, DialogStyle } from '../dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../utilities/services/user.service';

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
    public userService : UserService
  ) {}

  public confirmPasswordReset() : void {
    if (this.oobCode) {
      this.userService.confirmPasswordReset(this.oobCode, this.newPassword).then((canProceed) => {
        if (canProceed) {
          this.onResetCallBack();
        }
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
