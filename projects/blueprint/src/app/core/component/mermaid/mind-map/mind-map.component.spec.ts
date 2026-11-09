import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import mermaid from 'mermaid';
import { configureTestEndpoint, testEndpoint, testHttpProviders } from 'projects/blueprint/src/app/testing/rdf-fixtures';
import { MindMapComponent } from './mind-map.component';

describe('MindMapComponent', () => {
  let fixture: ComponentFixture<MindMapComponent>;

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('renders the project returned by the endpoint before teardown', async () => {
    const render = spyOn(mermaid, 'render').and.callThrough();
    await TestBed.configureTestingModule({
      imports: [MindMapComponent], providers: testHttpProviders
    }).compileComponents();
    const http = configureTestEndpoint();
    fixture = TestBed.createComponent(MindMapComponent);
    const request = http.expectOne(testEndpoint);
    expect(request.request.method).toBe('POST');
    request.flush('<https://ld.flux.zazuko.com/project/work-in-progress-34> <http://www.w3.org/2000/01/rdf-schema#label> "Fixture project" .');
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.all(render.calls.all().map(call => call.returnValue));
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
    expect(render).toHaveBeenCalled();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('svg')).not.toBeNull();
    expect(element.textContent).toContain('Fixture project');
  });
});
