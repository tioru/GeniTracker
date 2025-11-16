import { Component, OnInit } from '@angular/core';
import { notificationModel, NotificationService, notificationSeverity } from '../../../utilities/services/notification.service';
import { Observable, of } from 'rxjs';
import { CommonModule, NgFor } from '@angular/common';
import { animations } from '../../animation';

@Component({
  selector: 'notification-center',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss',
  animations: animations
})
export class NotificationCenterComponent implements OnInit {
  constructor(
    public notificationService : NotificationService
  ) {}

  public notifications: Observable<Array<notificationModel>> = of([]);
  public notificationSeverity = notificationSeverity
  
  ngOnInit(): void {
    this.notifications = this.notificationService.notifications$;
  }
}
