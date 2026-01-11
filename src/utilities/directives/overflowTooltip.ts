import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[overflowTooltip]',
  standalone: true
})
export class OverflowTooltipDirective implements AfterViewInit {
  @Input() tooltipText?: string;
  private hasOverflow = false;

  constructor(
    private el: ElementRef
  ) {}

  ngAfterViewInit() {
    window.addEventListener('resize', () => {
        this.checkOverflow();
    })

    setTimeout(() => {
      this.checkOverflow();
    }, 0);
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.checkOverflow();
  }

  private checkOverflow() {
    const element = this.el.nativeElement as HTMLElement;
    this.hasOverflow = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

    if (this.hasOverflow) {
      element.setAttribute('textOverflow', 'true');
    } else {
      element.removeAttribute('textOverflow');
    }
  }
}