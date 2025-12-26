import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'tooltip-component',
  standalone: true,
  imports: [],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent {
  isVisible = false;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.isVisible = true;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isVisible = false;
  }
}
