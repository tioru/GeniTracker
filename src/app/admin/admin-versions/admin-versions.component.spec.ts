import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVersionsComponent } from './admin-versions.component';

describe('AdminVersionsComponent', () => {
  let component: AdminVersionsComponent;
  let fixture: ComponentFixture<AdminVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVersionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
