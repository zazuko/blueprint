import { Injectable, inject, signal } from '@angular/core';

import { Observable, ReplaySubject, of, map } from 'rxjs';

import { GraphQueryBuilderService } from '../query-builder/graph-query-builder.service';

import { Graph, RdfUiGraphNode, RdfUiLink } from '../../../../core/component/graph/model/graph.model';

import { flux, rdf } from '@blueprint/ontology';
import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

export interface QueryInput {
  nodeIri: string;
}

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  readonly #queryBuilder = inject(GraphQueryBuilderService);

  #nodesMap = new Map<string, RdfUiGraphNode>();
  #linksMap = new Map<string, RdfUiLink>();

  #currentDataset = rdfEnvironment.dataset();

  // The graph$ observable is used to emit the current graph state.
  // It is a ReplaySubject with a buffer size of 1, meaning it will emit the last value to new subscribers.
  public graph$ = new ReplaySubject<Graph>(1);

  #internalGraphSignal = signal<Graph>({
    nodes: [],
    links: [],
  });

  graphSignal = this.#internalGraphSignal.asReadonly();

  /**
  * Clears the current dataset by resetting the nodes and links.
  * This is useful when the user wants to start a new graph.
  */
  public clearGraph(): void {
    this.#currentDataset = rdfEnvironment.dataset();
    // Reset the nodes and links maps
    this.#linksMap.clear();
    this.#nodesMap.clear();
    this.#nodesMap = new Map<string, RdfUiGraphNode>();
    this.#linksMap = new Map<string, RdfUiLink>();
    this.graph$.next({ nodes: [], links: [] });
    this.#internalGraphSignal.set({ nodes: [], links: [] });

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
        this.#internalGraphSignal.set(graph);
      },
      error: (err) => {
        console.error(err);
      }
    }
    );
  }


  /**
   * Create Exapnd SOARQL Query
   * 
   * @param expandedNodeIri The IRI of the node to expand.
   */
  #query(expandedNodeIri: string): Observable<Graph> {
    const data: Graph = {
      nodes: [],
      links: [],
    };
    if (expandedNodeIri.length === 0) {
      return of(data);
    }
    return this.#queryBuilder.buildQuery(expandedNodeIri).pipe(
      map((response) => {
        this.#currentDataset.addAll(response.data);
        const cfGraph = rdfEnvironment.clownface(this.#currentDataset);

        const nodes = cfGraph.node(flux.UiNodeNamedNode).in(rdf.typeNamedNode).map(n => new RdfUiGraphNode(n));
        const links = cfGraph.in(flux.linkNamedNode).map(rdfLink => new RdfUiLink(rdfLink, response.linkDefinitions.find(link => link.iri === rdfLink.out(flux.linkNamedNode).value)));

        // find the expanded (current) node
        const currentNode = nodes.find(node => node.iri === expandedNodeIri);
        console.assert(currentNode !== undefined, 'Current node should be defined');

        nodes.forEach(node => {
          if (node.isBlankNode) {
            node.logTable();
          }
        });

        // node position
        // if the current node does not have a position, set it to (0, 0)
        if (currentNode.x === undefined || currentNode.y === undefined) {
          currentNode.x = 0;
          currentNode.y = 0;
        }

        const currentX = currentNode.x;
        const currentY = currentNode.y;

        // set the postion of the neighbors to the current node position if they do not have a position
        // this makes the new expanded nodes appear in the same position as the current node
        const neighborNodes = links.filter(link => link.source.iri === currentNode.iri || link.target.iri === currentNode.iri).flatMap(link => [link.source, link.target]).filter(node => node.iri !== currentNode.iri);
        neighborNodes.forEach(node => {
          if (node.x === undefined || node.y === undefined) {
            // set the position of the neighbor node to the current node position
            node.x = currentX;
            node.y = currentY;
          }

        })

        const linksAndNodes: Graph = {
          nodes: nodes,
          links: links
        };
        return linksAndNodes;
      })
    );
  }

}
