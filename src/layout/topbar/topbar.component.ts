import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { animations } from '../../app/animation';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  animations: animations,
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements  OnInit {

  constructor() {}
    
  ngOnInit(): void {
  }
}
