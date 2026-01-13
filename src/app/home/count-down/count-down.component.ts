import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-count-down',
  standalone: true,
  imports: [],
  templateUrl: './count-down.component.html',
  styleUrl: './count-down.component.scss'
})
export class CountDownComponent implements OnInit{
  public hours : string [] = ['0', '0'];
  public minutes : string [] = ['0', '0'];
  public seconds : string [] = ['0', '0'];

  private resetHour: number = 4;
  private resetMinute: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.hourListening();
  }

  public hourListening() {
    
  }
}
