import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EFatSelectorModalComponent } from './e-fat-selector-modal.component';

describe('EFatSelectorModalComponent', () => {
  let component: EFatSelectorModalComponent;
  let fixture: ComponentFixture<EFatSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EFatSelectorModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EFatSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
