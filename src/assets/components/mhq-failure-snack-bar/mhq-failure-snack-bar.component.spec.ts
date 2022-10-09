import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MhqFailureSnackBarComponent } from './mhq-failure-snack-bar.component';

describe('MhqFailureSnackBarComponent', () => {
  let component: MhqFailureSnackBarComponent;
  let fixture: ComponentFixture<MhqFailureSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MhqFailureSnackBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MhqFailureSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
