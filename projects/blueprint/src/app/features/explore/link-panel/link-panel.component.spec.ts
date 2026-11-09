import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdfConsolidatedLink } from '@blueprint/component/graph/model/graph.model';
import { flux, rdf } from '@blueprint/ontology';
import { rdfEnvironment } from '../../../core/rdf/rdf-environment';
import { LinkPanelComponent } from './link-panel.component';

describe('LinkPanelComponent', () => {
  let fixture: ComponentFixture<LinkPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkPanelComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LinkPanelComponent);
  });

  it('accepts the selected consolidated graph link', () => {
    const iri = rdfEnvironment.namedNode('http://example.org/link');
    const dataset = rdfEnvironment.dataset().addAll([
      rdfEnvironment.quad(iri, rdf.typeNamedNode, flux.ConsolidatedLinkNamedNode)
    ]);
    const link = new RdfConsolidatedLink(rdfEnvironment.clownface(dataset).node(iri));
    fixture.componentRef.setInput('link', link);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.link()).toBe(link);
    expect(fixture.componentInstance.link().iri).toBe(iri.value);
  });
});
