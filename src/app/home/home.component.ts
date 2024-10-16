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
  
  public sendNotification() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.INFO,
      detail : "detail de test" + this.counter,
      sticky: true
    })
    this.counter += 1
  }
}
