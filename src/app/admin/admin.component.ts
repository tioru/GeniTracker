import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AdminVersionsComponent } from "./admin-versions/admin-versions.component";
import { animations } from '../animation';
import { FormsModule } from '@angular/forms';

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
export class AdminComponent {
  
  public adminPanels = AdminPanels;

  public selectedAdminPanel: AdminPanels = AdminPanels.DASHBOARD;

  public alterningView: boolean = false;

  constructor(
  ) {}
  
  public selectAdminPanel(panel: AdminPanels) {
    this.selectedAdminPanel = panel;
    this.alterningView = true;
    setTimeout(() => {
      this.alterningView = false;
    }, 300);
  }
}
