import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDailyResetComponent } from './admin-daily-reset.component';

describe('AdminDailyResetComponent', () => {
  let component: AdminDailyResetComponent;
  let fixture: ComponentFixture<AdminDailyResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDailyResetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDailyResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
