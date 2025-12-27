import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, UserCredential, createUserWithEmailAndPassword, User, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset, updateEmail, updatePassword } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { NotificationService, notificationSeverity } from './notification.service';
import { FirebaseErrorService } from './firebase-error.service';
import { GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { Database, get, ref, set, update } from '@angular/fire/database';
import { ProjectClass } from '../classes/class';
import { UserMapper } from '../mapper/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  private database = inject(Database);

  constructor(private auth: Auth, public notificationService : NotificationService, public firebaseErrorService: FirebaseErrorService) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public async logIn(email: string, password: string) : Promise<UserCredential | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.notificationService.addNotification({
        title: 'Connecté',
        severity: notificationSeverity.OK,
        detail: `Bienvenue ${userCredential.user.displayName ? userCredential.user.displayName : userCredential.user.email}`,
        sticky: false,
        delay: 5000
      });
      this.updateLastLoginDate(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return null;
    }
  }

  public async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  public async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public async register(email: string, password: string) : Promise<UserCredential | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      this.notificationService.addNotification({
        title: 'Connecté',
        severity: notificationSeverity.OK,
        detail: `Bienvenue ${userCredential.user.email}`,
        sticky: false,
        delay: 5000
      });
      return userCredential;
    } catch (error) {
      this.notificationService.addNotification({
        title: 'Erreur lors de l\'enregistrement',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return null;
    }
  }

  public async logOut() {
    setTimeout(() => {
      this.auth.signOut();
    // Delay to allow popover to close before logging out
    }, 200);
  }

  public async loginWithGoogle() : Promise<User | null> {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, googleProvider);
      this.notificationService.addNotification({
        title: 'Connecté',
        severity: notificationSeverity.OK,
        detail: `Bienvenue ${userCredential.user.displayName}`,
        sticky: false,
        delay: 5000
      });
      this.updateLastLoginDate(userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }
    return null;
  }

  public async sendPasswordResetEmail(email : string) : Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email)
      this.notificationService.addNotification({
        title: 'Connecté',
        severity: notificationSeverity.OK,
        detail: `Email de réinitialisation de mot de passe envoyé`,
        sticky: false,
        delay: 5000
      });
    } catch (error: any) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }
  }

  public async confirmPasswordReset(oobCode : string, newPassword: string): Promise<boolean> {
    try {
      await confirmPasswordReset(this.auth, oobCode, newPassword)
      this.notificationService.addNotification({
        title: 'Modification réussie',
        severity: notificationSeverity.OK,
        detail: `Modification du mot de passe réussie`,
        sticky: false,
        delay: 5000
      });
    } catch (error: any) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      
      if (error?.code === 'auth/weak-password') {
        return false;
      }
    }
    return true;
  }

  public async updateUserNameAndProfilePicture(newUserName : string, newProfilePictureLink: string) : Promise<boolean> {
    try {
      await updateProfile(this.auth.currentUser!, {
        displayName: newUserName,
        photoURL: newProfilePictureLink
      });

      this.notificationService.addNotification({
        title: 'Modification réussie',
        severity: notificationSeverity.OK,
        detail: `Modification du nom d'utilisateur et de la photo de profil réussie`,
        sticky: false,
        delay: 5000
      });
    } catch (error: any) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return false;
    }
    return true;
  }

  public async duplicateUser() : Promise<void> {
    try {
      const userRef = ref(this.database, `users/${this.auth.currentUser?.uid}`);
        
      await set(userRef, UserMapper.mapLocal(new ProjectClass.Local.User({
        displayName: this.auth.currentUser?.displayName ? this.auth.currentUser.displayName : '',
        email: this.auth.currentUser?.email ? this.auth.currentUser.email : '',
        photoURL: this.auth.currentUser?.photoURL ? this.auth.currentUser.photoURL : '',
        signUpDate: new Date()
      })));
    } catch (error) {
      console.error("Error duplicating user data: ", error);
    }
  }

  public async getUserByUID(uid: string): Promise<ProjectClass.Local.User | null> {
    try {
      const userRef = ref(this.database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return UserMapper.mapRemote(userData, uid);
      } else {
        console.log(`Aucun utilisateur trouvé avec l'UID: ${uid}`);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  public async updateLastLoginDate(uid : string) : Promise<void> {
    try {
      this.getUserByUID(uid).then((user) => {
        if (user) {
          user.lastLoginDate = new Date();
          const userRef = ref(this.database, `users/${uid}`);
          set(userRef, UserMapper.mapLocal(user)).catch((error) => {
            console.error('Erreur lors de la mise à jour de la date de dernière connexion :', error);
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la date de dernière connexion :', error);
    }
  }

  public async updateDuplicatedUserName(newUserName : string) : Promise<void> {
    try {
      const userRef = ref(this.database, `users/${this.auth.currentUser?.uid}`);
        
      await update(userRef, {
        displayName: newUserName
      });
    } catch (error) {
      console.error("Error duplicating user data: ", error);
    }
  }

  public async updateDuplicatedUserProfilePicture(newProfilePictureLink : string) : Promise<void> {
    try {
      const userRef = ref(this.database, `users/${this.auth.currentUser?.uid}`);
        
      await update(userRef, {
        photoURL: newProfilePictureLink
      });
    } catch (error) {
      console.error("Error duplicating user data: ", error);
    }
  }

  public async updateUserName(newUserName : string) : Promise<boolean> {
    try {
      await updateProfile(this.auth.currentUser!, {
        displayName: newUserName,
        photoURL: this.currentUserValue?.photoURL
      });

      this.updateDuplicatedUserName(newUserName)

      this.notificationService.addNotification({
        title: 'Modification réussie',
        severity: notificationSeverity.OK,
        detail: `Modification du nom d'utilisateur réussie`,
        sticky: false,
        delay: 5000
      });
    } catch (error: any) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return false;
    }
    return true;
  }

  public async updateProfilePicture(newProfilePictureLink: string) : Promise<boolean> {
    try {
      await updateProfile(this.auth.currentUser!, {
        displayName: this.currentUserValue?.displayName,
        photoURL: newProfilePictureLink
      });

      this.updateDuplicatedUserProfilePicture(newProfilePictureLink);

      this.notificationService.addNotification({
        title: 'Modification réussie',
        severity: notificationSeverity.OK,
        detail: `Modification de la photo de profil réussie`,
        sticky: false,
        delay: 5000
      });
    } catch (error: any) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return false;
    }
    return true;
  }

  public async updateEmail(newEmail : string) : Promise<boolean> {
    try {
      await updateEmail(this.auth.currentUser!, newEmail)

      this.updateDuplicatedUserMail(newEmail);

      this.notificationService.addNotification({
        title: 'Modification réussie',
        severity: notificationSeverity.OK,
        detail: `Modification de l'adresse mail réussie`,
        sticky: false,
        delay: 5000
      });
    } catch(error) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return false;
    }
    return true;
  }

  public async updateDuplicatedUserMail(newEmail : string) : Promise<void> {
    try {
      const userRef = ref(this.database, `users/${this.auth.currentUser?.uid}`);
        
      await update(userRef, {
        email: newEmail
      });
    } catch (error) {
      console.error("Error duplicating user data: ", error);
    }
  }

  public async updatePassword(newpassword : string) : Promise<boolean> {
    try {
      await updatePassword(this.auth.currentUser!, newpassword)

      this.notificationService.addNotification({
        title: 'Modification réussie',
        severity: notificationSeverity.OK,
        detail: `Modification du mot de passe réussie`,
        sticky: false,
        delay: 5000
      });
    } catch(error) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
      return false;
    }
    return true;
  }
}