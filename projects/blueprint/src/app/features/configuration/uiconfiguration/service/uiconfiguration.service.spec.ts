import { TestBed } from '@angular/core/testing';

import { UIConfigurationService } from './uiconfiguration.service';

describe('UIConfigurationService', () => {
  let service: UIConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
