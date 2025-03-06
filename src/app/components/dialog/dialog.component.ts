import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'dialog-component',
  standalone: true,
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  @Input() headerVisibility : boolean = true;
  @Input() footerVisibility : boolean = true;
  @Input() closable : boolean = true;
  @Input() modal : boolean = true;
  @Input() height : string = "auto";
  @Input() width : string = "auto";

  @ViewChild('header', { read: ViewContainerRef }) headerContainer!: ViewContainerRef;
  @ViewChild('content', { read: ViewContainerRef }) contentContainer!: ViewContainerRef;
  @ViewChild('footer', { read: ViewContainerRef }) footerContainer!: ViewContainerRef;
}
