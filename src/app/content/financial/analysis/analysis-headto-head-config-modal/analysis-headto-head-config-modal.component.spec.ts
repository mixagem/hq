import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisHeadtoHeadConfigModalComponent } from './analysis-headto-head-config-modal.component';

describe('AnalysisHeadtoHeadConfigModalComponent', () => {
  let component: AnalysisHeadtoHeadConfigModalComponent;
  let fixture: ComponentFixture<AnalysisHeadtoHeadConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisHeadtoHeadConfigModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisHeadtoHeadConfigModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
