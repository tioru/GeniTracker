import { Injectable } from '@angular/core';

export interface FirebaseErrorMessages {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseErrorService {
  
  private readonly errorMessages: FirebaseErrorMessages = {
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
    'auth/missing-password': 'Veuillez saisir un mot de passe.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/invalid-credential': 'Email/mot de passe incorrect.',
    
    'auth/invalid-action-code': 'Code de réinitialisation invalide ou expiré.',
    
    'PERMISSION_DENIED': 'Permissions insuffisantes.',
    'CREDENTIAL_TOO_OLD_LOGIN_AGAIN': 'Votre session est trop ancienne afin de procéder à cette opération. Veuillez vous reconnecter et réessayer.',
    
    'default': 'Une erreur inattendue s\'est produite.'
  };

  public getErrorMessage(errorCode: string): string {
    return this.errorMessages[errorCode] || this.errorMessages['default'];
  }

  public handleFirebaseError(error: any): string {
    if (error?.code) {
      return this.getErrorMessage(error.code);
    }
    
    return error?.message || this.errorMessages['default'];
  }
}