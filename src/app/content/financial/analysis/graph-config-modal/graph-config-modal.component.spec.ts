import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphConfigModalComponent } from './graph-config-modal.component';

describe('GraphConfigModalComponent', () => {
  let component: GraphConfigModalComponent;
  let fixture: ComponentFixture<GraphConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphConfigModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphConfigModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
