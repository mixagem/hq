import { TestBed } from '@angular/core/testing';

import { MonthlyViewService } from './monthly-view.service';

describe('MonthlyViewService', () => {
  let service: MonthlyViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
