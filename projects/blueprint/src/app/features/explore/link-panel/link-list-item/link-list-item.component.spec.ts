import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdfUiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { rdfEnvironment } from '../../../../core/rdf/rdf-environment';
import { LinkListItemComponent } from './link-list-item.component';

describe('LinkListItemComponent', () => {
  let fixture: ComponentFixture<LinkListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkListItemComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LinkListItemComponent);
  });

  it('renders the label and ordered forward and inverse path fragments', () => {
    const dataset = rdfEnvironment.parseTurtle(`
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix ex: <http://example.org/> .
      ex:link sh:name "Related organizations" ;
        sh:path (ex:member [sh:inversePath ex:owner]) .
    `);
    const link = new RdfUiLinkDefinition(
      rdfEnvironment.clownface(dataset).namedNode('http://example.org/link')
    );
    fixture.componentRef.setInput('label', link);
    fixture.detectChanges();

    expect(fixture.componentInstance.label()).toBe(link);
    expect(fixture.componentInstance.path().map(part => ({
      iri: part.predicateIri, inverse: part.isInverse
    }))).toEqual([
      { iri: 'http://example.org/member', inverse: false },
      { iri: 'http://example.org/owner', inverse: true }
    ]);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Related organizations');
    const values = Array.from(element.querySelectorAll('.value'));
    expect(values.length).toBe(2);
    expect(values[0].textContent).toContain('member');
    expect(values[1].textContent).toContain('^');
    expect(values[1].textContent).toContain('owner');
  });
});
