import { TestBed } from '@angular/core/testing';

import { GridViewService } from './grid-view.service';

describe('GridViewService', () => {
  let service: GridViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
