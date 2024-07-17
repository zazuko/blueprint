import { TestBed } from '@angular/core/testing';

import { UiAppearanceReasonerService } from './ui-appearance-reasoner.service';

describe('UiAppearanceReasonerService', () => {
  let service: UiAppearanceReasonerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiAppearanceReasonerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
