import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCategoryConfirmationModalComponent } from './delete-category-confirmation-modal.component';

describe('DeleteCategoryConfirmationModalComponent', () => {
  let component: DeleteCategoryConfirmationModalComponent;
  let fixture: ComponentFixture<DeleteCategoryConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteCategoryConfirmationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCategoryConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
