import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import mermaid from 'mermaid';
import { configureTestEndpoint, testEndpoint, testHttpProviders } from 'projects/blueprint/src/app/testing/rdf-fixtures';
import { PlaygroundComponent } from './playground.component';

describe('PlaygroundComponent', () => {
  let fixture: ComponentFixture<PlaygroundComponent>;

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('renders both diagrams before the fixture is destroyed', async () => {
    const render = spyOn(mermaid, 'render').and.callThrough();
    await TestBed.configureTestingModule({
      imports: [PlaygroundComponent], providers: testHttpProviders
    }).compileComponents();
    const http = configureTestEndpoint();
    fixture = TestBed.createComponent(PlaygroundComponent);
    fixture.detectChanges();
    const request = http.expectOne(testEndpoint);
    expect(request.request.method).toBe('POST');
    request.flush('<https://ld.flux.zazuko.com/project/work-in-progress-34> <http://www.w3.org/2000/01/rdf-schema#label> "Playground project" .');
    await fixture.whenStable();
    await Promise.all(render.calls.all().map(call => call.returnValue));
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('svg').length).toBe(2);
    expect(element.textContent).toContain('Christmas');
    expect(element.textContent).toContain('Playground project');
  });
});
