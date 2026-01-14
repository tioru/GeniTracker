import { Component, OnInit } from '@angular/core';
import { DailyResetService } from '../../../utilities/services/dailyReset.service';

@Component({
  selector: 'app-count-down',
  standalone: true,
  imports: [],
  templateUrl: './count-down.component.html',
  styleUrl: './count-down.component.scss'
})
export class CountDownComponent implements OnInit{

  constructor(public dailyResetService : DailyResetService) {}

  ngOnInit(): void {
    this.hourListening();
  }

  public hourListening() {
    this.dailyResetService.dailyResetListening();
  }
}
