import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharsInfosComponent } from './chars-infos.component';

describe('CharsInfosComponent', () => {
  let component: CharsInfosComponent;
  let fixture: ComponentFixture<CharsInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharsInfosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharsInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
