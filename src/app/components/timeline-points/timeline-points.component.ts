import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'timeline-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-points.component.html',
  styleUrl: './timeline-points.component.scss'
})
export class TimelinePointsComponent implements OnInit {
  @Input() pointNumber : number = 0;
  @Input() currentProgression : number = 0;

  public pointNumberArray : number[] = []

  ngOnInit(): void {
    this.pointNumberArray = Array(this.pointNumber).fill(0);
  }
}
