import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisEvolutionConfigModalComponent } from './analysis-evolution-config-modal.component';

describe('AnalysisEvolutionConfigModalComponent', () => {
  let component: AnalysisEvolutionConfigModalComponent;
  let fixture: ComponentFixture<AnalysisEvolutionConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisEvolutionConfigModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisEvolutionConfigModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
