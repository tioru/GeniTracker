import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface notificationModel{
  title : string,
  severity : notificationSeverity,
  detail : string,
  delay? : number
  sticky? : boolean
}

const DEFAULT_NOTIFICATION_DELAY_VALUE = 3000 // In milliseconds
const DEFAULT_NOTIFICATION_STICKY_VALUE = false

export enum notificationSeverity {
  ERROR,
  WARNING,
  INFO,
  OK
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject: BehaviorSubject<Array<notificationModel>> = new BehaviorSubject<Array<notificationModel>>([]);
  public notifications$: Observable<Array<notificationModel>> = this.notificationsSubject.asObservable();
  
  constructor(
  
  ) {}

  public addNotification(notification : notificationModel) : void {
    const currentNotifications = this.notificationsSubject.value;

    if (!notification.delay) {
      notification.delay = DEFAULT_NOTIFICATION_DELAY_VALUE
    }

    if (!notification.sticky) {
      notification.sticky = DEFAULT_NOTIFICATION_STICKY_VALUE
    }

    const updatedNotifications = [...currentNotifications, notification];

    this.notificationsSubject.next(updatedNotifications);

    if (notification.delay && !notification.sticky) {
      setTimeout(
        () => {
          this.removeNotification(notification);
        }, notification.delay);
    }
  }

  public removeNotification(removedNotification : notificationModel) : void {
    const currentNotifications = this.notificationsSubject.value;

    const updatedNotifications = currentNotifications.filter((notification) => 
      notification != removedNotification
    );

    this.notificationsSubject.next(updatedNotifications);
  }
}