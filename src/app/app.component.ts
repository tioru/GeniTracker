import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { NotificationCenterComponent } from './components/notification-center/notification-center.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, NotificationCenterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GeniTracker';
  baseUrl = environment.baseUrl;

  get backgroundImageUrl() {
    return `url("${environment.baseUrl}/assets/img/Background.png")`;
  }

  ngOnInit() {
    document.documentElement.style.setProperty(
      '--bg-image', 
      `url("${environment.baseUrl}/assets/img/Background.png")`
    );
  }
}
