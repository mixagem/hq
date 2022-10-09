import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MhqSucessSnackBarComponent } from './mhq-sucess-snack-bar.component';

describe('MhqSucessSnackBarComponent', () => {
  let component: MhqSucessSnackBarComponent;
  let fixture: ComponentFixture<MhqSucessSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MhqSucessSnackBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MhqSucessSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
