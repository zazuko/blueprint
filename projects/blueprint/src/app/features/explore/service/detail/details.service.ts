import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import * as sparql from 'rdf-sparql-builder'

import {
  FluxDetailViewer,
  FluxGroupViewer,
  FluxHyperlinkViewer,
  FluxLiteralViewer,
  FluxValueTableViewer,
  FluxViewerType,
} from '../../flux-viewer/index';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { RdfUiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { rdf, shacl } from '@blueprint/ontology';
import { PathPredicate } from '../../flux-viewer/model/path-predicate.model';
import { BlueprintGraph, BlueprintUiMetadataGraph } from '../../flux-viewer/metadata-utilities';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { sparqlUtils } from 'projects/blueprint/src/app/core/utils/sparql-utils';


export interface ObjectDetails {
  iri: string;
  type: string[];
  label: string[];
  description: string[];
  icon: string[];
  color: string;
  viewer: Array<FluxDetailViewer>;
}

@Injectable({
  providedIn: 'root',
})
export class DetailsService {
  private readonly sparqlService = inject(SparqlService);
  private readonly uiClassMetadataService = inject(UiClassMetadataService);

  public getDetailMetadataSparqlQuery(input: string): string {
    return getDetailsMetaData(input)
  }

  public query(input: string): Observable<ObjectDetails> {
    const detailQuery = getDetailsMetaData(input);
    const inputQuery = inputNodeQuery(input);
    const uiMetaDataQuery = this.uiClassMetadataService.getClassMetadataSparqlQuery();

    const sparqlQuery = sparqlUtils.mergeConstruct([detailQuery, inputQuery, uiMetaDataQuery])

    return this.sparqlService.construct(sparqlQuery).pipe(
      map(dataset => {
        const uiMetaDataNode = rdfEnvironment.clownface(dataset).namedNode(input).out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).toArray()[0];
        // todo: handel multiple types
        const uiMetaData = new RdfUiClassMetadata(uiMetaDataNode);
        const bpGraph = new BlueprintGraph(dataset);
        const node = bpGraph.getNode(rdfEnvironment.namedNode(input));

        const details: ObjectDetails = {
          iri: node.iri,
          type: [uiMetaData.label],
          label: node.label,
          description: node.comment,
          icon: [uiMetaData.icon],
          color: uiMetaData.color,
          viewer: this._buildDetailViewersFromMetaModel(input, dataset),
        };
        return details;
      })
    );
  }

  public _buildDetailViewersFromMetaModel(
    input: string,
    metaModel: RdfTypes.Dataset
  ): FluxDetailViewer[] {
    const metaGraph = new BlueprintUiMetadataGraph(metaModel);
    const inputNode = rdfEnvironment.namedNode(input);
    const viewers = metaGraph.getViewer();
    viewers.forEach((viewer) => {
      if (viewer.viewerType === FluxViewerType.LiteralViewer) {
        viewer.sparqlQuery = this.dashLiteralSparqlBuilder(
          viewer as FluxLiteralViewer,
          inputNode
        );
      } else if (viewer.viewerType === FluxViewerType.HyperlinkViewer) {
        viewer.sparqlQuery = this.dashHyperLinkSparqlBuilder(
          viewer as FluxHyperlinkViewer,
          inputNode
        );
      } else if (viewer.viewerType === FluxViewerType.ValueTableViewer) {
        viewer.sparqlQuery = this.dashValueTableSparqlBuilder(
          viewer as FluxValueTableViewer,
          inputNode
        );
      } else if (viewer.viewerType === FluxViewerType.GroupViewer) {
        viewer.sparqlQuery = this.dashGroupSparqlBuilder(
          viewer as FluxGroupViewer,
          inputNode
        );
      } else {
        console.log('detailsService# unknown viewer type', viewer);
      }
      if (
        viewer.metadata.type !== shacl.PropertyGroupNamedNode.value &&
        viewer.sparqlQuery === null
      ) {
        console.log(
          'Invalid SPARQL Query in viewer',
          viewer.label,
          viewer.iri,
          viewer.metadata.prettyPrint()
        );
      }
    });

    const validViewers = viewers.filter(
      (v) => v.viewerType === FluxViewerType.GroupViewer || v.sparqlQuery
    );

    return validViewers;
  }

  private dashLiteralSparqlBuilder(
    viewer: FluxLiteralViewer,
    input: RdfTypes.NamedNode
  ): string {
    const paths = viewer.getPathsPredicates();

    let intermediateCounter = 0;

    const sparqlSelects = [];
    paths.forEach((path) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pathQueries: any[][] = [];

      path.forEach((pathElement, index, arr) => {
        const isLast = index === arr.length - 1;
        const isFirst = index === 0;

        let subject = null;
        let object = null;
        const predicate = rdfEnvironment.namedNode(pathElement.iri);

        if (pathElement.isInverse) {
          if (isFirst) {
            object = input;
          }
          if (isLast) {
            subject = rdfEnvironment.variable('literal');
          }

          if (object === null) {
            object = rdfEnvironment.variable(`var_${intermediateCounter}`);
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`var_${++intermediateCounter}`);
          }
        } else {
          if (isFirst) {
            subject = input;
          }
          if (isLast) {
            object = rdfEnvironment.variable('literal');
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`var_${intermediateCounter}`);
          }

          if (object === null) {
            object = rdfEnvironment.variable(`var_${++intermediateCounter}`);
          }
        }
        pathQueries.push([subject, predicate, object]);
      });
      const literalVar = rdfEnvironment.variable('literal');
      sparqlSelects.push(
        sparql.select([literalVar]).where(pathQueries).orderBy([literalVar])
      );
    });

    if (sparqlSelects.length > 1) {
      return sparql
        .select([rdfEnvironment.variable('literal')])
        .where([sparql.union([sparqlSelects])]);
    } else if (sparqlSelects.length === 1) {
      return sparqlSelects[0].toString();
    }
    return null;
  }

  private dashHyperLinkSparqlBuilder(
    viewer: FluxHyperlinkViewer,
    input: RdfTypes.NamedNode
  ): string {
    const aPaths = viewer.getLiteralPathsPredicates();
    const hrefPaths = viewer.getHrefPathsPredicates();

    const hyperLinkPaths = aPaths.map((aPath, index) => {
      const h: HyperLinkPath = {
        aPath,
        hrefPath: hrefPaths[index],
      };
      return h;
    });

    const hyperLinkSelects = [];

    hyperLinkPaths.forEach((hyperLink) => {
      let aIntermediateCounter = 0;
      let hrefIntermediateCounter = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aPathQueries: any[][] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hrefPathQueries: any[][] = [];

      hyperLink.aPath.forEach((pathElement, index, arr) => {
        const isLast = index === arr.length - 1;
        const isFirst = index === 0;

        let subject = null;
        let object = null;
        const predicate = rdfEnvironment.namedNode(pathElement.iri);

        if (pathElement.isInverse) {
          if (isFirst) {
            object = input;
          }
          if (isLast) {
            subject = rdfEnvironment.variable('a');
          }

          if (object === null) {
            object = rdfEnvironment.variable(`var_${aIntermediateCounter}`);
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`var_${++aIntermediateCounter}`);
          }
        } else {
          if (isFirst) {
            subject = input;
          }
          if (isLast) {
            object = rdfEnvironment.variable('a');
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`var_${aIntermediateCounter}`);
          }

          if (object === null) {
            object = rdfEnvironment.variable(`var_${++aIntermediateCounter}`);
          }
        }
        aPathQueries.push([subject, predicate, object]);
      });

      hyperLink.hrefPath.forEach((pathElement, index, arr) => {
        const isLast = index === arr.length - 1;
        const isFirst = index === 0;

        let subject = null;
        let object = null;
        const predicate = rdfEnvironment.namedNode(pathElement.iri);

        if (pathElement.isInverse) {
          if (isFirst) {
            object = input;
          }
          if (isLast) {
            subject = rdfEnvironment.variable('href');
          }

          if (object === null) {
            object = rdfEnvironment.variable(`var_${hrefIntermediateCounter}`);
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`var_${++hrefIntermediateCounter}`);
          }
        } else {
          if (isFirst) {
            subject = input;
          }
          if (isLast) {
            object = rdfEnvironment.variable('href');
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`var_${hrefIntermediateCounter}`);
          }

          if (object === null) {
            object = rdfEnvironment.variable(`var_${++hrefIntermediateCounter}`);
          }
        }
        hrefPathQueries.push([subject, predicate, object]);
      });

      const aVar = rdfEnvironment.variable('a');
      const hrefVar = rdfEnvironment.variable('href');

      hyperLinkSelects.push(
        sparql
          .select([aVar, hrefVar])
          .where([
            sparql.select([aVar]).where(aPathQueries),
            sparql.select([hrefVar]).where(hrefPathQueries),
          ])
      );
    });

    if (hyperLinkSelects.length > 1) {
      const aVar = rdfEnvironment.variable('a');
      const hrefVar = rdfEnvironment.variable('href');

      return sparql.select([aVar, hrefVar]).union(hyperLinkSelects).toString();
    } else if (hyperLinkSelects.length === 1) {
      return hyperLinkSelects[0].toString();
    }

    return null;
  }

  private dashGroupSparqlBuilder(
    viewer: FluxGroupViewer,
    input: RdfTypes.NamedNode
  ): string {
    viewer.members.forEach((memberViewer) => {
      if (memberViewer.viewerType === FluxViewerType.LiteralViewer) {
        memberViewer.sparqlQuery = this.dashLiteralSparqlBuilder(
          memberViewer as FluxLiteralViewer,
          input
        );
      } else if (memberViewer.viewerType === FluxViewerType.HyperlinkViewer) {
        memberViewer.sparqlQuery = this.dashHyperLinkSparqlBuilder(
          memberViewer as FluxHyperlinkViewer,
          input
        );
      } else if (memberViewer.viewerType === FluxViewerType.ValueTableViewer) {
        memberViewer.sparqlQuery = this.dashValueTableSparqlBuilder(
          memberViewer as FluxValueTableViewer,
          input
        );
      } else {
        console.log(
          'detailsService#dashGroupViewerFactory: unknown viewer type',
          memberViewer
        );
      }
    });
    return null;
  }

  private dashValueTableSparqlBuilder(
    viewer: FluxValueTableViewer,
    input
  ): string {
    const rowPath = viewer.getRowPath();
    const columnPaths = viewer.getColumnPaths();

    if (rowPath.length === 0 || columnPaths.length === 0) {
      return null;
    }
    const rowPathQueries = [];
    let rowIntermediateCounter = 0;

    rowPath.forEach((pathElement, index, arr) => {
      const isLast = index === arr.length - 1;
      const isFirst = index === 0;

      let subject = null;
      let object = null;
      const predicate = rdfEnvironment.namedNode(pathElement.iri);

      if (pathElement.isInverse) {
        if (isFirst) {
          object = input;
        }
        if (isLast) {
          subject = rdfEnvironment.variable('row');
        }

        if (object === null) {
          object = rdfEnvironment.variable(`rowVar_${rowIntermediateCounter}`);
        }

        if (subject === null) {
          subject = rdfEnvironment.variable(`rowVar_${++rowIntermediateCounter}`);
        }
      } else {
        if (isFirst) {
          subject = input;
        }
        if (isLast) {
          object = rdfEnvironment.variable('row');
        }

        if (subject === null) {
          subject = rdfEnvironment.variable(`rowVar_${rowIntermediateCounter}`);
        }

        if (object === null) {
          object = rdfEnvironment.variable(`rowVar_${++rowIntermediateCounter}`);
        }
      }
      rowPathQueries.push([subject, predicate, object]);
    });

    const rowVariable = rdfEnvironment.variable('row');

    let columnCounter = 0;
    let intermediateCounter = 0;
    const columnVars = [];

    columnPaths.forEach((columnPath) => {
      ++columnCounter;
      columnPath.forEach((pathElement, index, arr) => {
        const isLast = index === arr.length - 1;
        const isFirst = index === 0;

        let subject = null;
        let object = null;
        const predicate = rdfEnvironment.namedNode(pathElement.iri);

        if (pathElement.isInverse) {
          if (isFirst) {
            object = rowVariable;
          }
          if (isLast) {
            subject = rdfEnvironment.variable(`col_${columnCounter}`);
            columnVars.push(subject);
          }

          if (object === null) {
            object = rdfEnvironment.variable(`colVar_${intermediateCounter}`);
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`colVar_${++intermediateCounter}`);
          }
        } else {
          if (isFirst) {
            subject = rowVariable;
          }
          if (isLast) {
            object = rdfEnvironment.variable(`col_${columnCounter}`);
            columnVars.push(object);
          }

          if (subject === null) {
            subject = rdfEnvironment.variable(`colVar_${intermediateCounter}`);
          }

          if (object === null) {
            object = rdfEnvironment.variable(`colVar_${++intermediateCounter}`);
          }
        }
        rowPathQueries.push([subject, predicate, object]);
      });
    });

    return sparql.select(columnVars).where(rowPathQueries).toString();
  }
}

interface HyperLinkPath {
  aPath: PathPredicate[];
  hrefPath: PathPredicate[];
}


function getDetailsMetaData(input: string): string {
  return `
CONSTRUCT {
  ?input a ?bpClass .
  ?viewer a <https://flux.described.at/Detail> .
  ?viewer <http://www.w3.org/ns/shacl#class> ?bpClass .
  ?viewer ?viewerP ?viewerO .
  ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> ?head .
  ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> ?tail .
    ?head ?pHead ?oHead .
    ?shNode ?pNode ?oNode .
    ?property ?propertyP ?propertyO .
    ?group ?groupP ?groupO .
  } WHERE {
    {
      BIND(<${input}> AS ?input)
      ?input a ?bpClass .
      ?viewer <http://www.w3.org/ns/shacl#class> ?bpClass .
      ?viewer <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://flux.described.at/Detail> .
      ?viewer ?viewerP ?viewerO . 
      OPTIONAL {
        ?viewer <http://www.w3.org/ns/shacl#path> ?path .
        ?path <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>* ?listRest .
        ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> ?head .
        ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> ?tail .
        OPTIONAL {
          ?head ?pHead ?oHead .
        }
      }
    }
    UNION
    {
      BIND(<${input}> AS ?input)
      ?input a ?bpClass .
      ?viewer <http://www.w3.org/ns/shacl#class> ?bpClass .
      ?viewer a <https://flux.described.at/Detail> .
      ?viewer <http://www.w3.org/ns/shacl#node> ?shNode .
      ?shNode ?pNode ?oNode . OPTIONAL {
        ?shNode <http://www.w3.org/ns/shacl#path> ?path .
        ?path <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>* ?listRest .
        ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> ?head .
        ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> ?tail .
        OPTIONAL {
          ?head ?pHead ?oHead .
        }
      } OPTIONAL {
        ?shNode <http://www.w3.org/ns/shacl#property> ?property .
        ?property ?propertyP ?propertyO .
        ?property <http://www.w3.org/ns/shacl#path> ?path .
        OPTIONAL {
          ?path <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest>* ?listRest .
          ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> ?head .
          ?listRest <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> ?tail .
          OPTIONAL {
            ?head ?pHead ?oHead .
          }
        }
      }
    }
    UNION
    {
      BIND(<${input}> AS ?input)
      ?input <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?bpClass .
      ?viewer <http://www.w3.org/ns/shacl#class> ?bpClass .
      ?viewer a <https://flux.described.at/Detail> .
      ?viewer <http://www.w3.org/ns/shacl#group> ?group .
      ?group ?groupP ?groupO .
    }
  }
  `
}

function inputNodeQuery(input: string): string {
  return `
CONSTRUCT {
  ?input ?predicate ?object.
  ?meta <http://www.w3.org/ns/shacl#targetNode> ?class .
} WHERE {
  {
    BIND(<${input}> AS ?input)
    VALUES ?predicate {
      <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
      <http://www.w3.org/2000/01/rdf-schema#label>
      <http://www.w3.org/2000/01/rdf-schema#comment>
    }
    ?input ?predicate ?object.
  }
  UNION {
    BIND(<${input}> AS ?input)
    ?input a ?class .
    ?meta <http://www.w3.org/ns/shacl#targetNode> ?class .
  }
} 
`
}