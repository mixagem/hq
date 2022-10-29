import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettachRecurrencyModalComponent } from './dettach-recurrency-modal.component';

describe('DettachRecurrencyModalComponent', () => {
  let component: DettachRecurrencyModalComponent;
  let fixture: ComponentFixture<DettachRecurrencyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DettachRecurrencyModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DettachRecurrencyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
