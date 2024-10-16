import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NotificationService, notificationSeverity } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(
    private notificationService : NotificationService    
  ) {}

  public handleError<T>(operation = 'operation', fallbackValue?: T) {
    return (error: any): Observable<T> => {
      let errorMessage = '';
      if (error.status === 400) {
        if (error.error.code) {
          errorMessage =(`error.${error.error.code}`);
        } else {
          errorMessage = "Erreur 400";
        }
      } else if (error.status === 401) {
        errorMessage = "Erreur 401";
      } else if (error.status === 403) {
        errorMessage = "Erreur 403";
      } else if (error.status === 404) {
        errorMessage = "Erreur 404";
      } else if (error.status === 500) {
        errorMessage = "Erreur 500";
      } else {
        errorMessage = `Erreur : ${operation}`;
      }
      
      // Display error message using MessageService
      if ( error.status !== 0) this.notificationService.addNotification({ severity: notificationSeverity.INFO, sticky: true, detail: errorMessage, title: "TEST"});

      // Log detailed error message to console
      console.error(errorMessage);

      return of(fallbackValue as T);
    };
  }
}
