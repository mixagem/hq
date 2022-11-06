import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSearchModalComponent } from './delete-search-modal.component';

describe('DeleteSearchModalComponent', () => {
  let component: DeleteSearchModalComponent;
  let fixture: ComponentFixture<DeleteSearchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteSearchModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
