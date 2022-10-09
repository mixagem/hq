import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewDailyDetailsModalComponent } from './overview-daily-details-modal.component';

describe('OverviewDailyDetailsModalComponent', () => {
  let component: OverviewDailyDetailsModalComponent;
  let fixture: ComponentFixture<OverviewDailyDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewDailyDetailsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewDailyDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
