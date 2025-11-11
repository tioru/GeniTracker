import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminVersionsComponent } from "./admin-versions/admin-versions.component";
import { animations } from '../animation';

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
  constructor() { }

  ngOnInit(): void {
  }

  public adminPanels = AdminPanels;

  selectedAdminPanel: AdminPanels = AdminPanels.VERSIONS;

  selectAdminPanel(panel: AdminPanels) {
    this.selectedAdminPanel = panel;
  }
}
