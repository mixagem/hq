import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTypeModalComponent } from './add-new-type-modal.component';

describe('AddNewTypeModalComponent', () => {
  let component: AddNewTypeModalComponent;
  let fixture: ComponentFixture<AddNewTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewTypeModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
