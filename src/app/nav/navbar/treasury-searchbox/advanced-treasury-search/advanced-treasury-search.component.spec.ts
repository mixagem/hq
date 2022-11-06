import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedTreasurySearchComponent } from './advanced-treasury-search.component';

describe('AdvancedTreasurySearchComponent', () => {
  let component: AdvancedTreasurySearchComponent;
  let fixture: ComponentFixture<AdvancedTreasurySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancedTreasurySearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedTreasurySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
