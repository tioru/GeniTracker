import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
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
  public isFloating = signal(false);

  public onScroll(event: Event): void {
    const scrollContainer = event.target as HTMLElement;
    this.isFloating.set(scrollContainer.scrollTop > 24);
  }
}
