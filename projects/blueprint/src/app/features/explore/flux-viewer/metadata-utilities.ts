import {
  MultiPointer,
  GraphPointer,
  AnyPointer,
} from 'clownface';


import rdfEnvironment from '@zazuko/env';
import { Dataset, NamedNode, Term } from '@rdfjs/types';

import { PathPredicate } from './model/path-predicate.model';
import { FluxDetailMetadata, FluxDetailViewer, FluxGroupViewer, FluxHyperlinkViewer, FluxLiteralViewer, FluxValueTableViewer, FluxViewer } from 'projects/blueprint/src/app/features/explore/flux-viewer';

import { shacl, rdfs, rdf, blueprint } from '@blueprint/ontology';

const dash = rdfEnvironment.namespace('http://datashapes.org/dash#');

export function getPaths(graphPointer: MultiPointer): Term[][] {
  const pathPointer = graphPointer.out(shacl.pathNamedNode);
  const paths = pathPointer.map((p) => {
    const list = p.list();
    if (list) {
      return [...list].map((y) => y.term);
    } else {
      return [p.term];
    }
  });
  return paths;
}

export function prettyPrintPath(path: Term[], graph: GraphPointer): string[] {
  return path?.map((p) => {
    const nodePointer = graph.node(p);
    if (nodePointer.term && nodePointer.term.termType === 'NamedNode') {
      return ` -> ${nodePointer.value}`;
    } else {
      return ` <- ${nodePointer.out(shacl.inversePathNamedNode).value}`;
    }
  });
}

export function getPathPredicates(cfNode: AnyPointer): PathPredicate[][] {
  const paths = getPaths(cfNode);
  return paths.map((path) => {
    return path.map((pathElement) => {
      const node = cfNode.node(pathElement);
      if (node.term.termType === 'NamedNode') {
        return {
          isInverse: false,
          iri: node.value,
          term: node.term,
          link: decodeURI(cfNode.term.value)
            .split('/')
            .pop()
            .replace(/\s/g, ''),
        };
      }
      return {
        isInverse: true,
        iri: node.out(shacl.inversePathNamedNode).value,
        term: node.out(shacl.inversePathNamedNode).term,
        link: decodeURI(cfNode.term.value).split('/').pop().replace(/\s/g, ''),
      };
    });
  });
}

export class BlueprintGraph {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cfGraph: AnyPointer<any, Dataset> = null;

  constructor(dataset: Dataset) {
    this.cfGraph = rdfEnvironment.clownface({ dataset });
  }

  getNode(node: NamedNode): FluxUiNode {
    return new FluxUiNode(this.cfGraph.namedNode(node));
  }

  getValueFromPath(sourceNode: FluxUiNode, path: PathPredicate[]): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pointer: MultiPointer<any, Dataset> = this.cfGraph.namedNode(
      sourceNode.iri
    );
    path.forEach((pathElement) => {
      if (!pathElement.isInverse) {
        pointer = pointer.out(pathElement.term);
      } else {
        pointer = pointer.in(pathElement.term);
      }
    });

    return pointer.values;
  }
}

export class BlueprintUiMetadataGraph {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cfMetadataGraph: AnyPointer<any, Dataset> = null;

  constructor(dataset: Dataset) {
    this.cfMetadataGraph = rdfEnvironment.clownface({ dataset });
  }

  getNode(node: NamedNode): FluxUiNode {
    return new FluxUiNode(this.cfMetadataGraph.namedNode(node));
  }

  getNodeViewers(node: FluxUiNode): FluxDetailViewer[] {
    const cfClasses = node.getFluxUiClass();

    const detailNodes: FluxDetailMetadata[] = [];
    cfClasses.forEach((cfClass) => {
      this.cfMetadataGraph
        .has(shacl.classNamedNode, cfClass)
        .has(dash['viewer'])
        .forEach((detailMeta) =>
          detailNodes.push(
            new FluxDetailMetadata(
              detailMeta as GraphPointer<NamedNode, Dataset>
            )
          )
        );
    });

    const allFluxViewers: FluxViewer[] = [];
    detailNodes.forEach((detailNode) => {
      if (detailNode.viewer.equals(dash['LiteralViewer'])) {
        allFluxViewers.push(new FluxLiteralViewer(detailNode));
      } else if (detailNode.viewer.equals(dash['HyperlinkViewer'])) {
        allFluxViewers.push(new FluxHyperlinkViewer(detailNode));
      } else if (detailNode.viewer.equals(dash['ValueTableViewer'])) {
        allFluxViewers.push(new FluxValueTableViewer(detailNode));
      } else {
        console.log('unknown Viewer', detailNode.prettyPrint());
      }
    });

    const bpViewersWithoutGroups = allFluxViewers.filter(
      (viewer) => viewer.group === null
    );
    const bpViewersGroups = allFluxViewers.filter(
      (viewer) => viewer.group !== null
    );

    const groups = new Set<string>();
    bpViewersGroups.forEach((viewerInGroup) => {
      groups.add(viewerInGroup.group);
    });

    const FluxGroupViewers: FluxGroupViewer[] = [];
    groups.forEach((group) => {
      const groupViewer = new FluxGroupViewer(
        new FluxDetailMetadata(this.cfMetadataGraph.namedNode(group))
      );
      groupViewer.members = bpViewersGroups
        .filter((viewer) => viewer.group === group)
        .sort((a, b) => a.order - b.order);
      FluxGroupViewers.push(groupViewer);
    });

    return [...FluxGroupViewers, ...bpViewersWithoutGroups].sort(
      (a, b) => a.order - b.order
    );
  }

  getViewer(): FluxViewer[] {
    const detailNodes: FluxDetailMetadata[] = [];
    this.cfMetadataGraph
      .has(dash['viewer'])
      .forEach((detailMeta) =>
        detailNodes.push(
          new FluxDetailMetadata(
            detailMeta as GraphPointer<NamedNode, Dataset>
          )
        )
      );

    const allFluxViewers: FluxViewer[] = [];
    detailNodes.forEach((detailNode) => {
      if (detailNode.viewer.equals(dash['LiteralViewer'])) {
        allFluxViewers.push(new FluxLiteralViewer(detailNode));
      } else if (detailNode.viewer.equals(dash['HyperlinkViewer'])) {
        allFluxViewers.push(new FluxHyperlinkViewer(detailNode));
      } else if (detailNode.viewer.equals(dash['ValueTableViewer'])) {
        allFluxViewers.push(new FluxValueTableViewer(detailNode));
      } else {
        console.log('unknown Viewer', detailNode.prettyPrint());
      }
    });

    const bpViewersWithoutGroups = allFluxViewers.filter(
      (viewer) => viewer.group === null
    );
    const bpViewersGroups = allFluxViewers.filter(
      (viewer) => viewer.group !== null
    );

    const groups = new Set<string>();
    bpViewersGroups.forEach((viewerInGroup) => {
      groups.add(viewerInGroup.group);
    });

    const FluxGroupViewers: FluxGroupViewer[] = [];
    groups.forEach((group) => {
      const groupViewer = new FluxGroupViewer(
        new FluxDetailMetadata(this.cfMetadataGraph.namedNode(group))
      );
      groupViewer.members = bpViewersGroups
        .filter((viewer) => viewer.group === group)
        .sort((a, b) => a.order - b.order);
      FluxGroupViewers.push(groupViewer);
    });

    return [...FluxGroupViewers, ...bpViewersWithoutGroups].sort(
      (a, b) => a.order - b.order
    );
  }
}

export class FluxUiNode {
  constructor(protected node: GraphPointer<NamedNode, Dataset>) { }

  get iri(): string {
    return this.node.value;
  }

  get label(): string[] {
    if (this.node.out(rdfs.labelNamedNode).values.length > 0) {
      return this.node.out(rdfs.labelNamedNode).values;
    }
    return [this.iri];
  }

  get comment(): string[] {
    return this.node.out(rdfs.commentNamedNode).values;
  }

  get icon(): string[] {
    return this.node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(blueprint.faIconNamedNode)
      .values;
  }

  get colorIndex(): string {
    return (
      this.node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(blueprint.colorIndexNamedNode)
        .values[0] ?? ''
    );
  }

  get type(): string[] {
    return this.node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(rdfs.labelNamedNode)
      .values;
  }

  getFluxUiClass(): MultiPointer {
    return this.node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode);
  }

  prettyPrint(): string {
    return `${this.node}`;
  }
}
