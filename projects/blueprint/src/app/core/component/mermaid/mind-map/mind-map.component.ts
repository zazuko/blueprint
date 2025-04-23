import { Component, ElementRef, OnDestroy, effect, inject, output, signal, viewChild } from '@angular/core';


import { MermaidService } from '../service/mermaid/mermaid.service';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { rdfs } from '../../../ontology/rdfs/rdfs';
import { rdf } from '../../../ontology/rdf/rdf';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { rdfEnvironment } from '../../../rdf/rdf-environment';


const projectIri = 'https://ld.flux.zazuko.com/project/work-in-progress-34';
const query = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <https://schema.org/>

CONSTRUCT {
    ?project rdfs:label ?projectLabel .

    ?project ?p ?person .
    ?person ?personPredicates ?personObject .   

    ?project ?pI ?personI .
    ?personI ?personPredicates ?personObject .

    ?project ?p ?repository .
    ?repository ?repositoryPredicates ?repositoryObject .

    ?project ?pI ?repositoryI .
    ?repositoryI ?repositoryPredicates ?repositoryObject .

    ?project <http://schema.example.org/customer> ?customer.
    ?customer ?customerPredicates ?customerObject

} WHERE {
    {
        BIND(<${projectIri}> as ?project)
        ?project rdfs:label ?projectLabel .

    } UNION
    {
        BIND(<${projectIri}> as ?project)
        ?project ?p ?person .
        ?person a schema:Person. 
         VALUES ?personPredicates {
            rdf:type
            rdfs:label
        }
        ?person ?personPredicates ?personObject .   
    } UNION 
    {
        BIND(<${projectIri}> as ?project)
        ?personI ?pI ?project .
        ?personI a schema:Person. 
         VALUES ?personPredicates {
            rdf:type
            rdfs:label
        }
        ?personI ?personPredicates ?personObject .   
    } 
    UNION {
        BIND(<${projectIri}> as ?project)
        ?project ?p ?repository .
        ?repository a <http://schema.example.org/Repository>.

        VALUES ?repositoryPredicates {
            rdf:type
            rdfs:label
        }
        ?repository ?repositoryPredicates ?repositoryObject .
    } UNION {
        BIND(<${projectIri}> as ?project)
        ?repositoryI ?pI ?project .
        ?repositoryI a <http://schema.example.org/Repository>.

        VALUES ?repositoryPredicates {
            rdf:type
            rdfs:label
        }
        ?repositoryI ?repositoryPredicates ?repositoryObject .
    }
    UNION {
        BIND(<${projectIri}> as ?project)
        ?project (<http://schema.example.org/bexioProject>|<http://schema.example.org/bexioOffer>)/<http://schema.example.org/customer> ?customer.
        ?customer a <https://schema.org/Organization>.

        VALUES ?customerPredicates {
            rdf:type
            rdfs:label
        }
        ?customer ?customerPredicates ?customerObject .
    }
    

}`;


@Component({
  selector: 'bp-mind-map',
  imports: [],
  templateUrl: './mind-map.component.html',
  styleUrl: './mind-map.component.scss'
})
export class MindMapComponent implements OnDestroy {
  selected = output<string>();
  private readonly mermaidElementRefSignal = viewChild<ElementRef>(`mermaid`);

  private readonly clickableElements = signal<NodeListOf<Element> | null>(null);
  private readonly _mermaidService = inject(MermaidService);
  private readonly _sparqlService = inject(SparqlService);

  private readonly mermaidCodeSignal = toSignal(
    this._sparqlService.construct(query).pipe(
      map((result) => {

        const center = rdfEnvironment.clownface(result, rdfEnvironment.namedNode(projectIri));
        const rootLabel = center.out(rdfs.labelNamedNode).values[0] ?? '';
        const persons: GraphValue[] = rdfEnvironment.clownface(result, rdfEnvironment.namedNode('https://schema.org/Person')).in(rdf.typeNamedNode).map(n => {
          const label = n.out(rdfs.labelNamedNode).values.join(', ');
          const iri = n.value;
          return { iri, label };
        });
        const repositories: GraphValue[] = rdfEnvironment.clownface(result, rdfEnvironment.namedNode('http://schema.example.org/Repository')).in(rdf.typeNamedNode).map(n => {
          const label = n.out(rdfs.labelNamedNode).values.join(', ');
          const iri = n.value;
          return { iri, label };
        });
        const customer: GraphValue[] = rdfEnvironment.clownface(result, rdfEnvironment.namedNode('https://schema.org/Organization')).in(rdf.typeNamedNode).map(n => {
          const label = n.out(rdfs.labelNamedNode).values.join(', ');
          const iri = n.value;
          return { iri, label };
        });
        const mmCode = `mindmap
root)${rootLabel ? rootLabel : 'empty'}(
${'\t'.repeat(1)}(People)
${'\t'.repeat(1)}::icon(fas fa-person)
${persons.map(v => `${'\t'.repeat(2)}["${v.label}"]\n${'\t'.repeat(2)}:::${v.iri} bp-node`).join(`\n`)}
${'\t'.repeat(1)}(Repository)
${'\t'.repeat(1)}::icon(fa-brands fa-git)
${repositories.map(v => `${'\t'.repeat(2)}["${v.label}"]\n${'\t'.repeat(2)}:::${v.iri} bp-node`).join(`\n`)}
${'\t'.repeat(1)}(Customer)
${'\t'.repeat(1)}::icon(fa-solid fa-building)
${customer.map(v => `${'\t'.repeat(2)}["${v.label}"]\n${'\t'.repeat(2)}:::${v.iri} bp-node`).join(`\n`)}
`;
        console.log(mmCode);
        return mmCode;
      })
    ));


  readonly #listenedElements: Element[] = [];

  constructor() {



    effect(() => {
      const nodeElements = this.clickableElements();
      if (!nodeElements) {
        return;
      }
      const clickableElements = Array.from(nodeElements);
      for (let i = 0; i < clickableElements.length; ++i) {
        const cssClasses = Array.from(clickableElements[i].classList).filter(c => c.startsWith('http'));
        const firstClass = cssClasses[0];
        if (firstClass) {
          this.#listenedElements.push(clickableElements[i]);
          (clickableElements[i] as HTMLElement).style.cursor = 'pointer';

          clickableElements[i].addEventListener('click', () => this.clickFunction(firstClass));
        }
      }
    });

    effect(() => {
      const element = this.mermaidElementRefSignal().nativeElement;
      const mermaidCode = this.mermaidCodeSignal();
      if (!element || !mermaidCode) {
        return;
      }
      this._mermaidService.render(0, mermaidCode, element, '.mindmap-node', this.clickableElements);
    });

  }

  clickFunction(iri: string) {
    this.selected.emit(iri);
  }

  ngOnDestroy(): void {
    this.#listenedElements.forEach(e => e.removeAllListeners());
  }
}


interface GraphValue {
  iri: string;
  label: string;
}