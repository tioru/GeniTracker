import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../layout/topbar/topbar.component';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TopbarComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.scss'
})
export class AppComponent {  
  constructor() { }
}