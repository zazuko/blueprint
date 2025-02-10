import { TestBed } from '@angular/core/testing';

import { UiWidgetRegistryService } from './ui-widget-registry.service';

describe('UiWidgetRegistryService', () => {
  let service: UiWidgetRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiWidgetRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
