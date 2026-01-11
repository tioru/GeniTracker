import { Component, ContentChild, ElementRef, EmbeddedViewRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'tooltip-component',
  standalone: true,
  imports: [],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent {
  @ViewChild('trigger', { static: true }) trigger!: ElementRef;
  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate!: TemplateRef<any>;
  @ContentChild('tooltipContent') tooltipContent?: ElementRef;

  public tooltipStyle = {
    position: 'fixed',
    top: "",
    left: "",
    transform: 'translate(-50%, -100%)',
    zIndex: 10000
  };

  public isVisible : boolean = true;
  public hasTooltipContent : boolean = false;
  private tooltipView? : EmbeddedViewRef<any>

  constructor(
    private renderer: Renderer2
  ) {}

  public showTooltip() : void {
    if (this.tooltipContent) {
      const element = this.tooltipContent.nativeElement;
      if (element.children.length > 0) {
        const rect = this.trigger.nativeElement.getBoundingClientRect();

        this.tooltipStyle.top = rect.top - 8 + "px"
        this.tooltipStyle.left = rect.left + rect.width / 2 + "px"

        this.isVisible = false;
        this.tooltipView = this.tooltipTemplate.createEmbeddedView({});
        this.tooltipView.detectChanges();

        const tooltipElement = this.tooltipView.rootNodes[0];
        this.renderer.appendChild(document.body, tooltipElement);

        setTimeout(() => {
          this.isVisible = true;
          this.tooltipView?.detectChanges();
        }, 10);
      };
    }
  }

  public hideTooltip() : void {
    this.isVisible = false;
    this.tooltipView?.detectChanges();
    
    setTimeout(() => {
      if (this.tooltipView) {
        const tooltipElement = this.tooltipView.rootNodes[0];
        this.renderer.removeChild(document.body, tooltipElement);
        this.tooltipView.destroy();
        this.tooltipView = undefined;
      }
    }, 200);
  }

  ngOnDestroy() {
    if (this.tooltipView) {
      const tooltipElement = this.tooltipView.rootNodes[0];
      this.renderer.removeChild(document.body, tooltipElement);
      this.tooltipView.destroy();
      this.tooltipView = undefined;
    }
  }
}
