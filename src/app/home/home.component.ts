import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { animations } from '../animation';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: animations
})
export class HomeComponent {
}