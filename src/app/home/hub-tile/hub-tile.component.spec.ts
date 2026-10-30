import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubTileComponent } from './hub-tile.component';

describe('HubTileComponent', () => {
  let component: HubTileComponent;
  let fixture: ComponentFixture<HubTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HubTileComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HubTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
