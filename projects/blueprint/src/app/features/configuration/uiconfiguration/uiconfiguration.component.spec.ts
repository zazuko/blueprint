import { provideRouter } from '@angular/router';
import { HttpTestingController } from '@angular/common/http/testing';
import { configureTestEndpoint, testHttpProviders } from 'projects/blueprint/src/app/testing/rdf-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UIConfigurationComponent } from './uiconfiguration.component';

describe('UIConfigurationComponent', () => {
  let component: UIConfigurationComponent;
  let fixture: ComponentFixture<UIConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UIConfigurationComponent],
      providers: [...testHttpProviders, provideRouter([])]
    })
    .compileComponents();

    configureTestEndpoint();
    fixture = TestBed.createComponent(UIConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
