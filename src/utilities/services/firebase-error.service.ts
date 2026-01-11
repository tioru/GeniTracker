import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { AuthErrorCodes } from 'firebase/auth';

export interface FirebaseErrorMessages {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseErrorService {
  
  private readonly errorMessages: FirebaseErrorMessages = {
    [AuthErrorCodes.INVALID_EMAIL] : 'Adresse email invalide.',
    [AuthErrorCodes.EMAIL_EXISTS] : 'Cette adresse email est déjà utilisée.',
    'auth/missing-password' : 'Veuillez saisir un mot de passe.',
    [AuthErrorCodes.WEAK_PASSWORD] : 'Le mot de passe doit contenir au moins 6 caractères.',
    [AuthErrorCodes.INVALID_LOGIN_CREDENTIALS] : 'Email/mot de passe incorrect.',
    [AuthErrorCodes.POPUP_CLOSED_BY_USER] : 'La fenêtre de connexion a été fermée avant la fin de l\'authentification',
    
    [AuthErrorCodes.INVALID_OOB_CODE] : 'Code de réinitialisation invalide ou expiré.',
    
    'PERMISSION_DENIED': 'Permissions insuffisantes.',
    [AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN] : 'Votre session est trop ancienne afin de procéder à cette opération. Veuillez vous reconnecter et réessayer.',
    
    'default': 'Une erreur inattendue s\'est produite.'
  };

  public getErrorMessage(errorCode: string): string {
    return this.errorMessages[errorCode] || this.errorMessages['default'];
  }

  public handleFirebaseError(error: any): string {
    if (error instanceof FirebaseError) {
      return this.getErrorMessage(error.code);
    }
    
    return error?.message || this.errorMessages['default'];
  }
}