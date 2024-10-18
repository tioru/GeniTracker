// response-handling.service.ts

import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NotificationService, notificationSeverity } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ResponseHandlingService {

  constructor(
    private notificationService: NotificationService
  ) {}

  public handleResponseTyped<T>(operation = 'operation', fallbackValue?: T) {
    return (response: HttpResponse<any>): Observable<T> => {
      if (response.status === 200) {
        return of(response.body as T);
      } else {
        console.error(`${operation} failed with status: ${response.status}`);
        return of(fallbackValue as T);
      }
    };
  }

  public handleResponseBoolean(operation = 'operation', message?: string) {
    return (response: HttpResponse<any>): Observable<boolean> => {
      if (response.status === 200 || response.status === 201) {
        if(message) {
            this.notificationService.addNotification({ severity: notificationSeverity.INFO, detail: message, title:operation });
        }
        return of(true);
      } else {
        console.error(`${operation} failed with status: ${response.status}`);
        return of(false);
      }
    };
  }

  public handleResponseArray<T>(operation = 'operation', fallbackValue: T[] = []) {
    return (response: HttpResponse<any>): Observable<T[]> => {
      if (response.status === 200 || response.status === 201) {
        return of(response.body as T[]);
      } else {
        console.error(`${operation} failed with status: ${response.status}`);
        return of(fallbackValue);
      }
    };
  }

  public handleResponseTOrNull<T>(operation = 'operation', message?: string) {
    return (response: HttpResponse<any>): Observable<T | null> => {
      if (response.status === 200 || response.status === 201) {
        if(message) {
            this.notificationService.addNotification({ severity: notificationSeverity.INFO, detail: message, title:operation });
        }
        return of(response.body as T);
      } else {
        console.error(`${operation} failed with status: ${response.status}`);
        return of(null);
      }
    };
  }
  
}
