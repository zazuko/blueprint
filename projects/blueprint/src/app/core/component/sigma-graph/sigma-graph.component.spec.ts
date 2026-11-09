import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigmaGraphComponent } from './sigma-graph.component';

describe('SigmaGraphComponent', () => {
  let component: SigmaGraphComponent;
  let fixture: ComponentFixture<SigmaGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigmaGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigmaGraphComponent);
    component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    element.style.cssText = 'display:block;width:640px;height:480px';
    fixture.componentRef.setInput('graph', { nodes: [], links: [] });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('canvas').length).toBeGreaterThan(0);
  });
});
