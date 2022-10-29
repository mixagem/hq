import { TestBed } from '@angular/core/testing';

import { BudgetingService } from './budgeting.service';

describe('BudgetingService', () => {
  let service: BudgetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
