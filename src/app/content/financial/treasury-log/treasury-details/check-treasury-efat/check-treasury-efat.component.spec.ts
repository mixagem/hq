import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckTreasuryEfatComponent } from './check-treasury-efat.component';

describe('CheckTreasuryEfatComponent', () => {
  let component: CheckTreasuryEfatComponent;
  let fixture: ComponentFixture<CheckTreasuryEfatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckTreasuryEfatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckTreasuryEfatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
