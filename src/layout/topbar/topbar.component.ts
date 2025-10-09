import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  constructor(
    public router: Router
  ) {}

  public get isHome(): boolean {
    return this.router.url === '/';
  }

  public goTo(path: string) {
    this.router.navigateByUrl(path)
  }
}
