import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ConfigService, LinkConfiguration } from '@blueprint/service/config/config.service';
import { configureTestEndpoint, testHttpProviders } from 'projects/blueprint/src/app/testing/rdf-fixtures';
import { UIConfigurationService } from './uiconfiguration.service';

describe('UIConfigurationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UIConfigurationService, ...testHttpProviders]
    });
    configureTestEndpoint();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('updates the configured link preference', () => {
    const service = TestBed.inject(UIConfigurationService);
    expect(service).toBeTruthy();
    expect(service.uiLinkConfiguration()).toBe(LinkConfiguration.BOTH);
    service.setLinkConfiguration(LinkConfiguration.RDF);
    expect(service.uiLinkConfiguration()).toBe(LinkConfiguration.RDF);
    expect(TestBed.inject(ConfigService).configuration().ui.linkConfiguration).toBe(LinkConfiguration.RDF);
  });
});
