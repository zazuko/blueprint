import { ComponentFixture, TestBed } from '@angular/core/testing';
import mermaid from 'mermaid';
import { FlowchartComponent } from './flowchart.component';

describe('FlowchartComponent', () => {
  let fixture: ComponentFixture<FlowchartComponent>;

  it('renders its flowchart before the fixture is destroyed', async () => {
    const render = spyOn(mermaid, 'render').and.callThrough();
    await TestBed.configureTestingModule({ imports: [FlowchartComponent] }).compileComponents();
    fixture = TestBed.createComponent(FlowchartComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.all(render.calls.all().map(call => call.returnValue));
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
    expect(render).toHaveBeenCalled();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('svg')).not.toBeNull();
    expect(element.textContent).toContain('Christmas');
  });
});
