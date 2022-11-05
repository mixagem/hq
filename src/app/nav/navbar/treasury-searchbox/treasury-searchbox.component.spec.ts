import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasurySearchboxComponent } from './treasury-searchbox.component';

describe('TreasurySearchboxComponent', () => {
  let component: TreasurySearchboxComponent;
  let fixture: ComponentFixture<TreasurySearchboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreasurySearchboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreasurySearchboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
