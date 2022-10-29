import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTreasauryLogModalComponent } from './delete-treasaury-log-modal.component';

describe('DeleteTreasauryLogModalComponent', () => {
  let component: DeleteTreasauryLogModalComponent;
  let fixture: ComponentFixture<DeleteTreasauryLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteTreasauryLogModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteTreasauryLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
