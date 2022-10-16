import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnualViewComponent } from './anual-view.component';

describe('AnualViewComponent', () => {
  let component: AnualViewComponent;
  let fixture: ComponentFixture<AnualViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnualViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnualViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
