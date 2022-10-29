import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRecurrencyModalComponent } from './update-recurrency-modal.component';

describe('UpdateRecurrencyModalComponent', () => {
  let component: UpdateRecurrencyModalComponent;
  let fixture: ComponentFixture<UpdateRecurrencyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateRecurrencyModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateRecurrencyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
