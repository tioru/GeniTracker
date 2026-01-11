import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, User, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset, updateEmail, updatePassword } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { Database, get, ref, set, update } from '@angular/fire/database';
import { ProjectClass } from '../classes/class';
import { UserMapper } from '../mapper/user';
import { FirebaseError } from 'firebase/app';

const ERROR_LOGIN_FAILED = 'Login failed';
const ERROR_GOOGLE_LOGIN_FAILED = 'Google Login failed';
const ERROR_REGISTRATION_FAILED = 'Registration failed';
const ERROR_PASSWORD_RESET_EMAIL_SEND_FAILED = 'Email password reset send failed';
const ERROR_PASSWORD_RESET_FAILED = 'Password reset failed';
const ERROR_PROFILE_UPDATE_FAILED = 'Profile update failed';
const ERROR_USER_DUPLICATION_FAILED = 'User duplication failed';
const ERROR_USER_RETRIEVING_FAILED = 'User retrieving failed';
const ERROR_LAST_LOGIN_DATE_UPDATE_FAILED = 'Last login date update failed';
const ERROR_DUPLICATED_USER_NAME_UPDATE_FAILED = 'Duplicated user\'s name update failed';
const ERROR_DUPLICATED_USER_PROFILE_PICTURE_UPDATE_FAILED = 'Duplicated user\'s profile picture update failed';
const ERROR_PROFILE_NAME_UPDATE_FAILED = 'Profile name update failed';
const ERROR_PROFILE_PICTURE_UPDATE_FAILED = 'Profile name update failed';
const ERROR_EMAIL_UPDATE_FAILED = 'Email update failed';
const ERROR_DUPLICATED_USER_EMAIL_UPDATE_FAILED = 'Duplicated user\'s email update failed';
const ERROR_PASSWORD_UPDATE_FAILED = 'Password update failed';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly database = inject(Database);

  private readonly userRef = (uid: string) => ref(this.database, `users/${uid}`);

  constructor(
    private readonly auth: Auth, 
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get meetsProfileRequirementsForChat() : boolean {
    return this.currentUserSubject.value ? !!this.currentUserSubject.value.displayName && !!this.currentUserSubject.value.photoURL : false;
  }

  public async logIn(email: string, password: string) : Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.updateLastLoginDate(userCredential.user.uid);
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_LOGIN_FAILED);
    }
  }

  public async loginWithGoogle() : Promise<void> {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, googleProvider);
      if (await this.getUserByUID(userCredential.user.uid)) {
        await this.updateLastLoginDate(userCredential.user.uid);
      } else {
        await this.duplicateUser();
        await this.updateLastLoginDate(userCredential.user.uid);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_GOOGLE_LOGIN_FAILED);
    }
  }

  public async register(email: string, password: string) : Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.duplicateUser();
      await this.updateLastLoginDate(userCredential.user.uid);
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_REGISTRATION_FAILED);
    }
  }

  public async logOut() {
    setTimeout(() => {
      this.auth.signOut();
    // Delay to allow popover to close before logging out
    }, 200);
  }

  public async sendPasswordResetEmail(email : string) : Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email)
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_PASSWORD_RESET_EMAIL_SEND_FAILED);
    }
  }

  public async confirmPasswordReset(oobCode : string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, oobCode, newPassword);
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_PASSWORD_RESET_FAILED);
    }
  }

  public async updateUserNameAndProfilePicture(newUserName : string, newProfilePictureLink: string) : Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updateProfile(this.auth.currentUser, {
          displayName: newUserName,
          photoURL: newProfilePictureLink
        });
      } else {
        throw new Error(ERROR_PROFILE_UPDATE_FAILED);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_PROFILE_UPDATE_FAILED);
    }
  }

  public async duplicateUser() : Promise<void> {
    try {
      if (this.auth.currentUser) {
        const currentDate : Date = new Date();
        await set(this.userRef(this.auth.currentUser.uid), UserMapper.mapLocal(new ProjectClass.Local.User({
          displayName: this.auth.currentUser.displayName,
          email: this.auth.currentUser.email,
          photoURL: this.auth.currentUser.photoURL,
          signUpDate: currentDate,
          lastLoginDate: currentDate,
          uid: this.auth.currentUser.uid
        })));
      } else {
        throw new Error(ERROR_USER_DUPLICATION_FAILED);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_USER_DUPLICATION_FAILED);
    }
  }

  public async getUserByUID(uid: string): Promise<ProjectClass.Local.User| null> {
    try {
      const snapshot = await get(this.userRef(uid));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return UserMapper.mapRemote(userData);
      } else {
        return null;
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_USER_RETRIEVING_FAILED);
    }
  }

  public async updateLastLoginDate(uid: string): Promise<void> {
    try {
      const user = await this.getUserByUID(uid);
      if (user) {
        user.lastLoginDate = new Date();
        await update(this.userRef(uid), UserMapper.mapLocal(user));
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_LAST_LOGIN_DATE_UPDATE_FAILED);
    }
  }

  public async updateDuplicatedUserName(newUserName : string) : Promise<void> {
    try {
      if (this.auth.currentUser) {
        await update(this.userRef(this.auth.currentUser.uid), {
          displayName: newUserName
        });
      } else {
        throw new Error(ERROR_DUPLICATED_USER_NAME_UPDATE_FAILED)
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_DUPLICATED_USER_NAME_UPDATE_FAILED);
    }
  }

  public async updateDuplicatedUserProfilePicture(newProfilePictureLink : string) : Promise<void> {
    try {
      if (this.auth.currentUser) {
        await update(this.userRef(this.auth.currentUser.uid), {
          photoURL: newProfilePictureLink
        });
      } else {
        throw new Error(ERROR_DUPLICATED_USER_PROFILE_PICTURE_UPDATE_FAILED)
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_DUPLICATED_USER_PROFILE_PICTURE_UPDATE_FAILED);
    }
  }

  public async updateUserName(newUserName : string) : Promise<void> {
    try {
      if (this.auth.currentUser && this.currentUserValue) {
        await updateProfile(this.auth.currentUser, {
          displayName: newUserName,
          photoURL: this.currentUserValue.photoURL
        });
        await this.updateDuplicatedUserName(newUserName);
      } else {
        throw new Error(ERROR_PROFILE_NAME_UPDATE_FAILED);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_PROFILE_NAME_UPDATE_FAILED);
    }
  }

  public async updateProfilePicture(newProfilePictureLink: string) : Promise<void> {
    try {
      if (this.auth.currentUser && this.currentUserValue) {
        await updateProfile(this.auth.currentUser, {
          displayName: this.currentUserValue.displayName,
          photoURL: newProfilePictureLink
        });
        await this.updateDuplicatedUserProfilePicture(newProfilePictureLink);
      } else {
        throw new Error(ERROR_PROFILE_PICTURE_UPDATE_FAILED);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_PROFILE_PICTURE_UPDATE_FAILED);
    }
  }

  public async updateEmail(newEmail : string) : Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updateEmail(this.auth.currentUser, newEmail);
        await this.updateDuplicatedUserMail(newEmail);
      } else {
        throw new Error(ERROR_EMAIL_UPDATE_FAILED);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_EMAIL_UPDATE_FAILED);
    }
  }

  public async updateDuplicatedUserMail(newEmail : string) : Promise<void> {
    try {
      if (this.auth.currentUser) {
        await update(this.userRef(this.auth.currentUser.uid), {
          email: newEmail
        });
      } else {
        throw new Error(ERROR_DUPLICATED_USER_EMAIL_UPDATE_FAILED);
      }
    } catch (error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_DUPLICATED_USER_EMAIL_UPDATE_FAILED);
    }
  }

  public async updatePassword(newpassword : string) : Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updatePassword(this.auth.currentUser, newpassword)
      } else {
        throw new Error(ERROR_PASSWORD_UPDATE_FAILED);
      }
    } catch(error) {
      throw error instanceof FirebaseError ? error : new Error(ERROR_PASSWORD_UPDATE_FAILED);
    }
  }
}