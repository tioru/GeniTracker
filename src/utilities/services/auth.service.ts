import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, UserCredential, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { NotificationService, notificationSeverity } from './notification.service';
import { FirebaseErrorService } from './firebase-error.service';

const MISSING_PASSWORD_ERROR = "Veuillez entrer un mot de passe.";
const WEAK_PASSWORD_ERROR = "";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, public notificationService : NotificationService, public firebaseErrorService: FirebaseErrorService) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  public async connexion(email: string, password: string) : Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
        this.notificationService.addNotification({
          title: 'Connecté',
          severity: notificationSeverity.OK,
          detail: `Bienvenue ${userCredential.user.email}`,
          sticky: false,
          delay: 5000
        });
      });
    } catch (error) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
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

  public async register(email: string, password: string) : Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
        this.notificationService.addNotification({
          title: 'Connecté',
          severity: notificationSeverity.OK,
          detail: `Bienvenue ${userCredential.user.email}`,
          sticky: false,
          delay: 5000
        });
      });
    } catch (error) {
      this.notificationService.addNotification({
        title: 'Erreur',
        severity: notificationSeverity.ERROR,
        detail: this.firebaseErrorService.handleFirebaseError(error),
        sticky: true
      });
    }
  }

  async deconnexion() {
    await this.auth.signOut();
  }
}