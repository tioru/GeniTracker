import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelinePointsComponent } from './timeline-points.component';

describe('TimelinePointsComponent', () => {
  let component: TimelinePointsComponent;
  let fixture: ComponentFixture<TimelinePointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelinePointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelinePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
