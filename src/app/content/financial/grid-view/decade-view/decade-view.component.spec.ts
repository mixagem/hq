import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecadeViewComponent } from './decade-view.component';

describe('DecadeViewComponent', () => {
  let component: DecadeViewComponent;
  let fixture: ComponentFixture<DecadeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecadeViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecadeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
