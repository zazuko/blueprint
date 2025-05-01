import { Injectable, inject } from '@angular/core';

import { Observable, ReplaySubject, of } from 'rxjs';
import { map } from 'rxjs/operators';


import { QueryBuilderService } from '../query-builder/query-builder.service';

import { Graph, RdfUiGraphNode, RdfUiLink } from '../../../../core/component/graph/model/graph.model';

import { blueprint, rdf } from '@blueprint/ontology';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

export interface QueryInput {
  nodeIri: string;
}

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  readonly #queryBuilder = inject(QueryBuilderService);

  #nodesMap = new Map<string, RdfUiGraphNode>();
  #linksMap = new Map<string, RdfUiLink>();

  #currentDataset = rdfEnvironment.dataset();


  public graph$ = new ReplaySubject<Graph>(1);
  /**
  * Clears the current dataset by resetting the nodes and links.
  * This is useful when the user wants to start a new graph.
  */
  public clearGraph(): void {
    console.log('%cclear', 'color:red');
    this.#currentDataset = rdfEnvironment.dataset();
    // Reset the nodes and links maps
    this.#linksMap.clear();
    this.#nodesMap.clear();
    this.#nodesMap = new Map<string, RdfUiGraphNode>();
    this.#linksMap = new Map<string, RdfUiLink>();
    this.graph$.next({ nodes: [], links: [] });
  }

  /**
   * This method is used to expand a node in the graph. It fetches thee neighbors of the node and adds them to the graph.
   * 
   * @param iri The IRI of the node to expand.
   */
  public expandNode(iri: string): void {
    this.#query(iri).subscribe({
      next: (graph) => {
        this.graph$.next(graph);
      },
      error: (err) => {
        console.error(err);
      }
    }
    );
  }



  #query(input: string): Observable<Graph> {
    const data: Graph = {
      nodes: [],
      links: [],
    };
    if (input.length === 0) {
      return of(data);
    }
    return this.#queryBuilder.buildQuery(input).pipe(
      map((dataset) => {
        this.#currentDataset.addAll(dataset);
        const cfGraph = rdfEnvironment.clownface(this.#currentDataset);
        const nodeElement = cfGraph.node(blueprint.UiNodeNamedNode).in(rdf.typeNamedNode).map((n, i) => {
          const newNode = new RdfUiGraphNode(n);
          return newNode;
        });

        const links = cfGraph.in(blueprint.linkNamedNode).map(n => new RdfUiLink(n));


        const linksAndNodes: Graph = {
          nodes: nodeElement,
          links: links
        };
        return linksAndNodes;
      })
    );
  }

}
