import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingCategoriesSnackBarComponent } from './missing-categories-snack-bar.component';

describe('MissingCategoriesSnackBarComponent', () => {
  let component: MissingCategoriesSnackBarComponent;
  let fixture: ComponentFixture<MissingCategoriesSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissingCategoriesSnackBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissingCategoriesSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
