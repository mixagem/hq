import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasuryLogComponent } from './treasury-log.component';

describe('TreasuryLogComponent', () => {
  let component: TreasuryLogComponent;
  let fixture: ComponentFixture<TreasuryLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreasuryLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreasuryLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
