import { Injectable, inject } from '@angular/core';

import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


import { GraphPointer } from 'clownface';

import { rdf, blueprint, shacl, rdfs } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';

import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { OutgoingPathFactory } from 'projects/blueprint/src/app/shared/sparql/path/factory/outgoing-path-factory';
import { IncomingPathFactory } from 'projects/blueprint/src/app/shared/sparql/path/factory/incoming-path-factory';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { sparqlUtils } from 'projects/blueprint/src/app/core/utils/sparql-utils';


@Injectable({
  providedIn: 'root',
})
export class QueryBuilderService {
  private readonly sparqlService = inject(SparqlService);
  private readonly uiClassMetadataService = inject(UiClassMetadataService);
  private readonly uiLinkMetadataService = inject(UiLinkMetadataService);

  /**
  * Builds a SPARQL query based on the input string.
  * 
  * @param input The input string to build the query from.
  * @returns An Observable that emits a Dataset containing the results of the query.
  */
  public buildQuery(input: string): Observable<RdfTypes.Dataset> {
    const dataset = rdfEnvironment.dataset();

    // Get the SPARQL queries for retrieving UI and link metadata
    const uiMetaDataQuery = this.uiClassMetadataService.getClassMetadataSparqlQuery();
    const linkMetaDataQuery = this.uiLinkMetadataService.getLinkMetadataSparqlQueryForNode(input);
    // Merge the UI and link metadata queries into a single query
    const mergedQuery = sparqlUtils.mergeConstruct([uiMetaDataQuery, linkMetaDataQuery]);

    // Execute the merged query to retrieve link metadata
    return this.sparqlService.construct(mergedQuery).pipe(
      switchMap(linkMetaDataset => {
        // Add the link metadata to the RDF dataset
        dataset.addAll(linkMetaDataset);
        // Build the SPARQL query strings from the retrieved metadata
        const getLinksQuery = this._buildQueryFromMetaModel(input, linkMetaDataset);

        // Execute the query strings to retrieve the final results
        return this.sparqlService.construct(getLinksQuery);
      }),
      map((ds) => {
        // add links and nodes to dataset
        dataset.addAll(ds)
        return dataset;
      }),
    );
  }

  private _buildQueryFromMetaModel(
    input: string,
    metaModel: RdfTypes.Dataset
  ): string {

    const inputNode = rdfEnvironment.namedNode(input);
    const metaGraph = rdfEnvironment.clownface(metaModel);

    const outLinkDefinitions = metaGraph
      .namedNode(inputNode)
      .out(rdf.typeNamedNode)
      .in(shacl.targetClassNamedNode).has(rdf.typeNamedNode, blueprint.LinkNamedNode).map(node => new UiLinkDefinition(node));


    const inLinkDefinitions = metaGraph
      .namedNode(inputNode)
      .out(rdf.typeNamedNode)
      .in(shacl.classNamedNode).has(rdf.typeNamedNode, blueprint.LinkNamedNode).map(node => new UiLinkDefinition(node));

    const inputQuery = getInputNodeQuery(inputNode);


    const outgoingLinkQueries = outLinkDefinitions.filter(link => link.propertyPath !== null).map(link => getOutgoingLinksQuery(inputNode, link));
    const incomingLinkQueries = inLinkDefinitions.filter(link => link.inversePropertyPath !== null).map(link => getIncomingLinksQuery(inputNode, link));

    const query = sparqlUtils.mergeConstruct([inputQuery, ...outgoingLinkQueries, ...incomingLinkQueries, this.uiClassMetadataService.getClassMetadataSparqlQuery()])
    return query;
  }

}

function getInputNodeQuery(input: RdfTypes.NamedNode): string {
  return `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}

CONSTRUCT {
  ?input ${rdfs.labelPrefixed} ?inputObject .
  ?input a ?inputClass .
} WHERE {
  BIND (<${input.value}> as ?input)
  ?input ${rdfs.labelPrefixed} ?inputObject .
  ?input ${rdf.typePrefixed} ?inputClass .
}
`;
}

function getOutgoingLinksQuery(input: RdfTypes.NamedNode, link: UiLinkDefinition): string {
  return `
  ${shacl.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}
PREFIX schema: <http://schema.org/>

CONSTRUCT {
  ?input a ?fluxUiType .
  ?input ${blueprint.hasUiLinkPrefixed} ?linkIri .
  ?linkIri ${blueprint.linkPrefixed} ?link ;
    ${blueprint.linkLabelPrefixed} ?linkLabel ;
    ${blueprint.hasUiLinkPrefixed} ?target .
  # Get type of the target node
  ?target a ?targetType .
  ?target a ?fluxUiType.
  ?target ${rdfs.labelPrefixed} ?targetLabel.
} WHERE {
  BIND (<${input.value}> as ?input)
  BIND (<${link.iri}> as ?link)
  BIND (${blueprint.UiNodePrefixed} as ?fluxUiType)
  BIND (<${link.arrowTarget}> as ?targetType)
  ?input ${link.propertyPath}  ?target .
  ?target a ?targetType .
  ?target ${rdfs.labelPrefixed} ?targetLabel .
  # get the link label
  ?link ${shacl.namePrefixed} ?linkLabel . 
  
  # create a unique iri for the link (reification)
  BIND(IRI(CONCAT(STR(?link), '/outgoing/', MD5(STR(?input)), '/', MD5(STR(?target)))) as ?linkIri )
}
`;
}

function getIncomingLinksQuery(input: RdfTypes.NamedNode, link: UiLinkDefinition): string {
  return `
  ${shacl.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}

CONSTRUCT {
  ?input a ?fluxUiType .
  ?linkIri ${blueprint.linkPrefixed} ?link ;
    ${blueprint.linkLabelPrefixed} ?linkLabel ;
    ${blueprint.hasUiLinkPrefixed} ?input .
  # Get type of the target node
  ?target a ?targetType .
  ?target a ?fluxUiType.
  ?target ${rdfs.labelPrefixed} ?targetLabel.
  ?target  ${blueprint.hasUiLinkPrefixed} ?linkIri .
} WHERE {
  BIND (<${input.value}> as ?input)
  BIND (<${link.iri}> as ?link)
  BIND (<${link.arrowSource}> as ?targetType)
  BIND (${blueprint.UiNodePrefixed} as ?fluxUiType)
  ?target ${link.propertyPath}  ?input  .
  ?target a ?targetType .
  ?target ${rdfs.labelPrefixed} ?targetLabel .
  # get the link label
  ?link ${shacl.namePrefixed} ?linkLabel . 
  
  # create a unique iri for the link (reification)
  BIND(IRI(CONCAT(STR(?link), '/incoming/', MD5(STR(?input)), '/', MD5(STR(?target)))) as ?linkIri )
}
`;
}





class UiLinkDefinition extends ClownfaceObject {
  #arrowSource: string | null | undefined = undefined;
  #arrowTarget: string | null | undefined = undefined;
  #name: string | undefined = undefined;
  #propertyPath: string | null | undefined = undefined;
  #inversePropertyPath: string | null | undefined = undefined;

  constructor(node: GraphPointer) {
    super(node);
  }

  get name(): string {
    if (this.#name === undefined) {
      const name = this._node.out(shacl.nameNamedNode).values;
      if (name.length === 0) {
        this.#name = '';
      } else {
        if (name.length > 1) {
          console.warn(`Multiple names found for link <${this._node.value}>. Using the first one.`);
        }
        this.#name = name[0];
      }
    }
    return this.#name;
  }

  get propertyPath(): string | null {
    if (this.#propertyPath == undefined) {
      const paths = this._node.out(shacl.pathNamedNode);
      const pathFactory = new OutgoingPathFactory();
      const propertyPaths = paths.map(path => pathFactory.createPath(path));

      if (propertyPaths.length === 0) {
        console.error(`No path found for link <${this._node.value}>`);
        this.#propertyPath = null;
        return this.#propertyPath;
      }

      if (propertyPaths.length > 1) {
        console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
      }
      this.#propertyPath = propertyPaths[0].toPropertyPath();
    }
    return this.#propertyPath;
  }

  get inversePropertyPath(): string | null {
    if (this.#inversePropertyPath === undefined) {
      const paths = this._node.out(shacl.pathNamedNode);
      const pathFactory = new IncomingPathFactory();
      const propertyPaths = paths.map(path => pathFactory.createPath(path));
      if (propertyPaths.length === 0) {
        console.error(`No path found for link <${this._node.value}>`);
        this.#inversePropertyPath = null;
        return this.#inversePropertyPath;
      }

      if (propertyPaths.length > 1) {
        console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
      }
      this.#inversePropertyPath = propertyPaths[0].toPropertyPath();
    }
    return this.#inversePropertyPath;
  }

  get arrowSource(): string | null {
    if (this.#arrowSource === undefined) {
      const source = this._node.out(shacl.targetClassNamedNode).values;
      if (source.length === 0) {
        console.error(`No source found for link <${this._node.value}>`);
        this.#arrowSource = null;
      } else {
        if (source.length > 1) {
          console.warn(`Multiple sources found for link <${this._node.value}>. Using the first one.`);
        }
        this.#arrowSource = source[0];
      }
    }
    return this.#arrowSource;
  }

  get arrowTarget(): string | null {
    if (this.#arrowTarget === undefined) {
      const targets = this._node.out(shacl.classNamedNode).values;
      if (targets.length === 0) {
        console.error(`No targets found for link <${this._node.value}>`);
        this.#arrowTarget = null;
      } else {
        if (targets.length > 1) {
          console.warn(`Multiple targets found for link <${this._node.value}>. Using the first one.`);
        }
        this.#arrowTarget = targets[0];
      }
    }
    return this.#arrowTarget;
  }

}