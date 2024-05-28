import { TestBed } from '@angular/core/testing';

import { AggregateService } from './aggregate.service';

describe('AggregateService', () => {
  let service: AggregateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AggregateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
