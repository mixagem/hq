import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MhqSnackBarComponent } from './mhq-snack-bar.component';

describe('MhqSnackBarComponent', () => {
  let component: MhqSnackBarComponent;
  let fixture: ComponentFixture<MhqSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MhqSnackBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MhqSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
