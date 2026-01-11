import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AdminVersionsComponent } from "./admin-versions/admin-versions.component";
import { animations } from '../animation';
import { UserService } from '../../utilities/services/user.service';
import { Router } from '@angular/router';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';
import { skip } from 'rxjs';

enum AdminPanels {
  DASHBOARD = 'Panel d\'aministration',
  VERSIONS = 'Versions',
  CHARACTERS = 'Personnages',
  WEAPONS = 'Armes',
  EVENTS = 'Événements'
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminVersionsComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: animations
})
export class AdminComponent implements OnInit {
  
  public adminPanels = AdminPanels;

  public selectedAdminPanel: AdminPanels = AdminPanels.DASHBOARD;

  public alterningView: boolean = false;

  constructor(
    public userService : UserService, 
    public router: Router,
    public notificationService : NotificationService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(() => {
      if (!this.userService.currentUserValue) {
        this.userService.currentUser$.pipe(skip(1)).subscribe(() => {
          if (!this.userService.currentUserValue) {
            this.router.navigateByUrl("/")
            this.notificationService.addNotification({
              title: 'Accès refusé',
              severity: notificationSeverity.WARNING,
              detail: 'La page que vous avez essayé d\'accéder requiert une connexion',
              sticky: true,
              delay: 5000
            })
          }
        })
      }
    })
  }
  
  public selectAdminPanel(panel: AdminPanels) {
    this.selectedAdminPanel = panel;
    this.alterningView = true;
    setTimeout(() => {
      this.alterningView = false;
    }, 300);
  }
}
