import { Component } from '@angular/core';
import { DailyResetService } from '../../../utilities/services/dailyReset.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-daily-reset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-daily-reset.component.html',
  styleUrl: './admin-daily-reset.component.scss'
})
export class AdminDailyResetComponent {
  constructor(
    public dailyResetService : DailyResetService
  ) {}

  ngOnInit() {
    this.dailyResetService.dailyResetListening();
  }
}
