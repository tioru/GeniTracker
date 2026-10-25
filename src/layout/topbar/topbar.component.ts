import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { animations } from '../../app/animation';

@Component({
    selector: 'app-topbar',
    imports: [RouterLink, RouterLinkActive],
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
