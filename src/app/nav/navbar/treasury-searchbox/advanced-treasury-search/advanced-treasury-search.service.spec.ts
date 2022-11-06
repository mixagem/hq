import { TestBed } from '@angular/core/testing';

import { AdvancedTreasurySearchService } from './advanced-treasury-search.service';

describe('AdvancedTreasurySearchService', () => {
  let service: AdvancedTreasurySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedTreasurySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
