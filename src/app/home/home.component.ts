import { Component } from '@angular/core';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    public notificationService : NotificationService
  ) {}

  public counter = 0
  
  public sendNotification1() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.ERROR,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }

  public sendNotification2() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.WARNING,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }

  public sendNotification3() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.INFO,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }

  public sendNotification4() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.OK,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }
}
