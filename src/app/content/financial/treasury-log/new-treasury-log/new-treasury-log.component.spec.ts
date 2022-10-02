import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTreasuryLogComponent } from './new-treasury-log.component';

describe('NewTreasuryLogComponent', () => {
  let component: NewTreasuryLogComponent;
  let fixture: ComponentFixture<NewTreasuryLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewTreasuryLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTreasuryLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
