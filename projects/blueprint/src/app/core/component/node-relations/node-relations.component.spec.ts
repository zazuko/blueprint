import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { configureTestEndpoint, testEndpoint, testHttpProviders, relationFixture, resourceFixture } from 'projects/blueprint/src/app/testing/rdf-fixtures';
import { NodeRelationsComponent } from './node-relations.component';

describe('NodeRelationsComponent', () => {
  let fixture: ComponentFixture<NodeRelationsComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeRelationsComponent],
      providers: testHttpProviders
    }).compileComponents();
    http = configureTestEndpoint();
    fixture = TestBed.createComponent(NodeRelationsComponent);
    fixture.componentRef.setInput('exploredResource', resourceFixture());
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('renders an empty endpoint result for the selected resource', async () => {
    TestBed.tick();
    const request = http.expectOne(testEndpoint);
    expect(request.request.method).toBe('POST');
    expect(new URLSearchParams(request.request.body).get('query')).toContain('http://example.org/root');
    request.flush('');
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.relations()).toEqual([]);
  });
});
