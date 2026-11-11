import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TalentDescriptionComponent } from './talent-description.component';

describe('TalentDescriptionComponent', () => {
  let component: TalentDescriptionComponent;
  let fixture: ComponentFixture<TalentDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalentDescriptionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TalentDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
