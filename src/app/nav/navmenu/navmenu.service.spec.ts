import { TestBed } from '@angular/core/testing';

import { NavmenuService } from './navmenu.service';

describe('NavmenuService', () => {
  let service: NavmenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavmenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
