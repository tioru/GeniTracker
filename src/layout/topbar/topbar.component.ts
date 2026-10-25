
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { animations } from '../../app/animation';

@Component({
    selector: 'app-topbar',
    imports: [],
    templateUrl: './topbar.component.html',
    animations: animations,
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements  OnInit {

  constructor() {}
    
  ngOnInit(): void {
  }
}
