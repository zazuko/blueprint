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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
