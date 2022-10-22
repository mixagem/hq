import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderCategoriesModalComponent } from './reorder-categories-modal.component';

describe('ReorderCategoriesModalComponent', () => {
  let component: ReorderCategoriesModalComponent;
  let fixture: ComponentFixture<ReorderCategoriesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReorderCategoriesModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReorderCategoriesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
