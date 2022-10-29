import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfaturaComponent } from './efatura.component';

describe('EfaturaComponent', () => {
  let component: EfaturaComponent;
  let fixture: ComponentFixture<EfaturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EfaturaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfaturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
