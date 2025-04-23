import { Injectable, inject } from '@angular/core';

import { Observable, ReplaySubject, of } from 'rxjs';
import { map } from 'rxjs/operators';


import { AnyPointer } from 'clownface';

import { QueryBuilderService } from '../query-builder/query-builder.service';

import { Graph } from '../../../../core/component/graph/model/graph.model';
import { GraphNode } from '../../../../core/component/graph/model/graph-node.model';
import { GraphLink } from '../../../../core/component/graph/model/graph-link.model';

import { blueprint, rdf, rdfs, shacl } from '@blueprint/ontology';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

export interface QueryInput {
  nodeIri: string;
}

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  private readonly queryBuilder = inject(QueryBuilderService);

  private nodes = new Map<string, GraphNode>();
  private links = new Map<string, GraphLink>();

  public graph$ = new ReplaySubject<Graph>(1);
  /**
  * Clears the current dataset by resetting the nodes and links.
  * This is useful when the user wants to start a new graph.
  */
  public clearGraph(): void {
    // Reset the nodes and links maps
    this.nodes = new Map<string, GraphNode>();
    this.links = new Map<string, GraphLink>();
    this.graph$.next({ nodes: [], links: [] });
  }

  public expandNode(iri: string): void {
    this.query(iri).subscribe({
      next: (graph) => {
        this.graph$.next(graph);
      },
      error: (err) => {
        console.error(err);
      }
    }
    );
  }

  public expandNamedNode(node: RdfTypes.NamedNode): void {
    this.query(node.value).subscribe({
      next: (graph) => {
        this.graph$.next(graph);
      },
      error: (err) => {
        console.error(err);
      }
    }
    );
  }

  public query(input: string): Observable<Graph> {
    const data: Graph = {
      nodes: [],
      links: [],
    };
    if (input.length === 0) {
      return of(data);
    }
    return this.queryBuilder.buildQuery(input).pipe(
      map((dataset) => {
        const linksAndNodes = this._extractNodesAndLinks(
          dataset,
          rdfEnvironment.namedNode(input)
        );
        return linksAndNodes;
      })
    );
  }

  private _extractNodesAndLinks(
    dataset: RdfTypes.Dataset,
    inputNode: RdfTypes.NamedNode
  ): Graph {
    const linkGraph = rdfEnvironment.clownface(dataset);

    const outgoingNeighborNodes = linkGraph
      .namedNode(inputNode)
      .out(blueprint.hasUiLinkNamedNode)
      .out(blueprint.hasUiLinkNamedNode).values;
    const incomingNeighborNodes = linkGraph
      .namedNode(inputNode)
      .in(blueprint.hasUiLinkNamedNode)
      .in(blueprint.hasUiLinkNamedNode).values;

    const allNodes = [...[inputNode.value], ...outgoingNeighborNodes, ...incomingNeighborNodes];
    allNodes.forEach((nodeIri) => {
      this._addNode(linkGraph.node(rdfEnvironment.namedNode(nodeIri)));
    });

    const outgoingLinks = linkGraph.namedNode(inputNode).out(blueprint.hasUiLinkNamedNode);
    const incomingLinks = linkGraph.namedNode(inputNode).in(blueprint.hasUiLinkNamedNode);

    outgoingLinks.forEach((link) => this._addLink(link));
    incomingLinks.forEach((link) => this._addLink(link));

    return {
      nodes: Array.from(this.nodes.values()),
      links: combineLinkWithSameSourceAndTarget(Array.from(this.links.values())),
    };
  }

  private _addNode(inputNode: AnyPointer): void {
    const nodeIri = inputNode.value;
    if (!nodeIri) {
      console.error('GraphService#_addNode: nodeIri is undefined');
      return;
    }
    if (this.nodes.has(nodeIri)) {
      // node already exists
      return;
    }



    const newNode = {} as GraphNode;
    newNode.id = nodeIri;
    newNode.label = inputNode.out(rdfs.labelNamedNode).values.join(' ,');
    newNode.type = inputNode.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(rdfs.labelNamedNode).values.join(' ,');
    newNode.icon = inputNode.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(blueprint.faIconNamedNode).values[0] ?? '';
    newNode.colorIndex =
      inputNode.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(blueprint.colorIndexNamedNode).values[0] ?? '0';

    this.nodes.set(nodeIri, newNode);
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _addLink(linkNode: any): void {
    const linkIri = linkNode.value;
    const reverseLinkParts = linkIri.split('/');
    const last = reverseLinkParts.pop();
    const secondLast = reverseLinkParts.pop();
    const reverseLinkIri = [...reverseLinkParts, ...[last, secondLast]].join(
      '/'
    );
    if (this.links.has(linkIri) || this.links.has(reverseLinkIri)) {
      return;
    }

    const srcNodeIri = linkNode.in(blueprint.hasUiLinkNamedNode).value;
    const targetNodeIri = linkNode.out(blueprint.hasUiLinkNamedNode).value;

    const srcNode = this.nodes.get(srcNodeIri);
    const targetNode = this.nodes.get(targetNodeIri);


    if (!srcNode || !targetNode) {
      console.assert(
        srcNode,
        `No source Node found for Link <${linkNode.value}>`
      );
      console.assert(
        targetNode,
        `No target Node found for Link <${linkNode.value}>`
      );
      return;
    }

    const newLink = {} as GraphLink;
    newLink.id = linkIri;
    newLink.label =
      linkNode.out(blueprint.linkLabelNamedNode).values.join(' ,') ?? 'no label';
    newLink.source = srcNode;
    newLink.target = targetNode;

    this.links.set(linkIri, newLink);
  }

}

export function combineLinkWithSameSourceAndTarget(
  links: GraphLink[]
): GraphLink[] {
  return links;
}

