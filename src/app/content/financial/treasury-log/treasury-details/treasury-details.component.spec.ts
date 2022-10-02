import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasuryDetailsComponent } from './treasury-details.component';

describe('TreasuryDetailsComponent', () => {
  let component: TreasuryDetailsComponent;
  let fixture: ComponentFixture<TreasuryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreasuryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreasuryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
