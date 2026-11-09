import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteralComponent, LiteralRenderType } from './literal.component';

describe('LiteralComponent', () => {
  let component: LiteralComponent;
  let fixture: ComponentFixture<LiteralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiteralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiteralComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('literal', { ruleIri: 'http://example.org/rule', label: 'Fixture label', value: [rdfEnvironment.literal('Fixture value')], renderer: LiteralRenderType.PLAIN, order: 0 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
