import { TestBed } from '@angular/core/testing';

import { NodeHighligherService } from './node-highligher.service';

describe('NodeHighligherService', () => {
  let service: NodeHighligherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeHighligherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
