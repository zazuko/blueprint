import { TestBed } from '@angular/core/testing';

import { TBoxService } from './tbox.service';

describe('TBoxServiceService', () => {
  let service: TBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
