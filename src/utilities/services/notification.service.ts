import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface notificationModel{
  title : string,
  severity : notificationSeverity,
  detail? : string,
  delay? : number
  sticky? : boolean
}

const DEFAULT_NOTIFICATION_DELAY_VALUE = 3000 // In milliseconds
const DEFAULT_NOTIFICATION_STICKY_VALUE = false

const FADE_OUT_DELAY_ANIMATION = 500 // In milliseconds

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
      setTimeout(() => {
        this.triggerFadeOut(notification);
  
        setTimeout(() => {
          this.removeNotification(notification);
        }, FADE_OUT_DELAY_ANIMATION);
      }, notification.delay);
    }
  }

  public closeNotification(notification: notificationModel): void {
    this.triggerFadeOut(notification);

    setTimeout(() => {
      this.removeNotification(notification);
    }, FADE_OUT_DELAY_ANIMATION);
  }

  public removeNotification(removedNotification : notificationModel) : void {
    const currentNotifications = this.notificationsSubject.value;

    const updatedNotifications = currentNotifications.filter((notification) => 
      notification != removedNotification
    );

    this.notificationsSubject.next(updatedNotifications);
  }

  private triggerFadeOut(notification: notificationModel): void {
    const index = this.notificationsSubject.value.findIndex(n => n === notification);
    if (index !== -1) {
      const notificationElement = document.getElementsByClassName('notification')[index];
      notificationElement.classList.add('fade-out');
    }
  }
}