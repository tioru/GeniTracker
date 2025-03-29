import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animations, FADE_DURATION } from './animations';

export enum DialogStyle {
  HBF,
  BF
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

  @Input() style : DialogStyle = DialogStyle.HBF
  @Output() onHide: EventEmitter<void> = new EventEmitter<void>();

  public dialogStyle : typeof DialogStyle = DialogStyle

  public onOustideDialogClick() : void {
    if (this.modal) {
      this.dialogVisibility = false;
    }
  }
}
