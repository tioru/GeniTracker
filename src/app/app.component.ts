import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { NotificationCenterComponent } from './components/notification-center/notification-center.component';
import { CommonModule } from '@angular/common';

interface Snowflake {
  left: number;
  size: number;
  duration: number;
  delay: number;
  blur: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, NotificationCenterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {  
  constructor() { }

  snowflakes: Snowflake[] = [];

  ngOnInit() {
    this.generateSnowflakes();
  }

  generateSnowflakes() {
    const count = 70;
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        blur: Math.random() * 2 + 0.5
      });
    }
  }
}