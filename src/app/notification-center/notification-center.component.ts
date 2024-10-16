import { Component, OnInit } from '@angular/core';
import { notificationModel, NotificationService } from '../../utilities/services/notification.service';
import { Observable, of } from 'rxjs';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss'
})
export class NotificationCenterComponent implements OnInit {
  constructor(
    public notificationService : NotificationService
  ) {}

  public notifications: Observable<Array<notificationModel>> = of([]);
  
  ngOnInit(): void {
    this.notifications = this.notificationService.notifications$;
  }
}
