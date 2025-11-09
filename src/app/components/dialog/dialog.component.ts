import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animations, FADE_DURATION } from './animations';

export enum DialogStyle {
  HBF,
  BF,
  B
}

@Component({
  selector: 'dialog-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  animations: animations
})
export class DialogComponent {
  private _dialogVisibility: boolean = false;

  @Input()
  get dialogVisibility(): boolean {
    return this._dialogVisibility;
  }

  set dialogVisibility(value: boolean) {
    if (value) {
      setTimeout(()=> {
        this._dialogVisibility = value;
      }, 1)
    }
    if (!value){
      this._dialogVisibility = value;
      setTimeout(()=> {
        this.onHide.emit()
      }, FADE_DURATION)
    }
  }
   
  @Input() headerVisibility : boolean = true;
  @Input() footerVisibility : boolean = true;
  @Input() closable : boolean = true;
  @Input() modal : boolean = true;
  @Input() height : string = "auto";
  @Input() width : string = "auto";
  @Input() backgroundMask : boolean = true;
  @Input() resetFields : boolean = true;
  @Input() draggable : boolean = false;

  @Input() style : DialogStyle = DialogStyle.HBF;
  @Output() onHide: EventEmitter<void> = new EventEmitter<void>();

  public dialogContainer : HTMLElement | null = null;

  public dialogStyle : typeof DialogStyle = DialogStyle;

  public initialPosX = 0;
  public initialPosY = 0;
  public terminalPosX = 0;
  public terminalPosY = 0;

  private mouseDownOutside = false;

  public onOutsideMouseUp() : void {
    if (this.modal && this.mouseDownOutside) {
      this.dialogVisibility = false;
    }
  }

  public onOutsideMouseDown() : void {
    this.mouseDownOutside = true;
  }

  public onDragStart(event: MouseEvent) : void {
    event.preventDefault();

    this.initialPosX = event.clientX;
    this.initialPosY = event.clientY;

    document.onmousemove = this.elementDrag.bind(this);
    document.onmouseup = this.onDragEnd.bind(this);
  }

  public elementDrag(event: MouseEvent) : void {
    event.preventDefault();
    this.dialogContainer = document.getElementById("dialog-container");

    this.terminalPosX = this.initialPosX - event.clientX;
    this.terminalPosY = this.initialPosY - event.clientY;

    this.initialPosX = event.clientX;
    this.initialPosY = event.clientY;
    if (this.dialogContainer && this.validDialogBound()) {
      this.dialogContainer.style.top = (this.dialogContainer.offsetTop - this.terminalPosY) + "px";
      this.dialogContainer.style.left = (this.dialogContainer.offsetLeft - this.terminalPosX) + "px";
    }
  }

  public validDialogBound() : boolean {
    if (!this.dialogContainer) return false;

    if (this.dialogContainer.offsetTop - this.terminalPosY < 0) return false;
    if (this.dialogContainer.offsetLeft - this.terminalPosX < 0) return false;
    if (this.dialogContainer.offsetLeft + this.dialogContainer.offsetWidth - this.terminalPosX > window.innerWidth) return false;
    if (this.dialogContainer.offsetTop + this.dialogContainer.offsetHeight - this.terminalPosY > window.innerHeight) return false;
    return true;
  }

  public onDragEnd() : void {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
