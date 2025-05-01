import { Injectable, inject } from '@angular/core';

import { Observable, ReplaySubject, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { QueryBuilderService } from '../query-builder/query-builder.service';

import { Graph, RdfUiGraphNode, RdfUiLink } from '../../../../core/component/graph/model/graph.model';

import { blueprint, rdf } from '@blueprint/ontology';
import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

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

  // The graph$ observable is used to emit the current graph state.
  // It is a ReplaySubject with a buffer size of 1, meaning it will emit the last value to new subscribers.
  public graph$ = new ReplaySubject<Graph>(1);

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
      map((dataset) => {
        this.#currentDataset.addAll(dataset);
        const cfGraph = rdfEnvironment.clownface(this.#currentDataset);

        const nodes = cfGraph.node(blueprint.UiNodeNamedNode).in(rdf.typeNamedNode).map(n => new RdfUiGraphNode(n));
        const links = cfGraph.in(blueprint.linkNamedNode).map(n => new RdfUiLink(n));

        // find the expanded (current) node
        const currentNode = nodes.find(node => node.iri === expandedNodeIri);
        console.assert(currentNode !== undefined, 'Current node should be defined');


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
            // to avoid that the link are shown as a loop we move it a bit
            node.x = currentX - 1;
            node.y = currentY - 1;
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
