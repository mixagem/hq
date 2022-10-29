import { TestBed } from '@angular/core/testing';

import { EfaturaService } from './efatura.service';

describe('EfaturaService', () => {
  let service: EfaturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EfaturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
