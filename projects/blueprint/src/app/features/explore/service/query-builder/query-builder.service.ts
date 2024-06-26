import { Injectable, inject } from '@angular/core';

import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import rdfEnvironment from '@zazuko/env';
import { Dataset, NamedNode } from '@rdfjs/types';

import { GraphPointer } from 'clownface';

import { rdf, blueprint, shacl, rdfs } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';
import { sparqlUtils } from '@blueprint/utils';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';


@Injectable({
  providedIn: 'root',
})
export class QueryBuilderService {
  private readonly sparqlService = inject(SparqlService);
  private readonly uiClassMetadataService = inject(UiClassMetadataService);
  private readonly uiLinkMetadataService = inject(UiLinkMetadataService);

  /**
  * Builds a SPARQL query based on the input string.
  * @param input The input string to build the query from.
  * @returns An Observable that emits a Dataset containing the results of the query.
  */
  public buildQuery(input: string): Observable<Dataset> {
    const dataset = rdfEnvironment.dataset();

    // Get the SPARQL queries for retrieving UI and link metadata
    const uiMetaDataQuery = this.uiClassMetadataService.getClassMetadataSparqlQuery();
    const linkMetaDataQuery = this.uiLinkMetadataService.getLinkMetadataSparqlQueryForNode(input);
    // Merge the UI and link metadata queries into a single query
    const uiMetaDatalinkMetaDataQuery = sparqlUtils.mergeConstruct([uiMetaDataQuery, linkMetaDataQuery]);

    // Execute the merged query to retrieve link metadata
    return this.sparqlService.construct(uiMetaDatalinkMetaDataQuery).pipe(
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
        return dataset as unknown as Dataset;
      }),
    );
  }

  private _buildQueryFromMetaModel(
    input: string,
    metaModel: Dataset
  ): string {

    const inputNode = rdfEnvironment.namedNode(input);
    const metaGraph = rdfEnvironment.clownface({ dataset: metaModel });

    const outLinkDefinitions =  metaGraph
    .namedNode(inputNode)
    .out(rdf.typeNamedNode)
    .in(shacl.targetClassNamedNode).has(rdf.typeNamedNode, blueprint.LinkNamedNode).map(node => new UiLinkDefinition(node));


    const inLinkDefinitions =  metaGraph
    .namedNode(inputNode)
    .out(rdf.typeNamedNode)
    .in(shacl.classNamedNode).has(rdf.typeNamedNode, blueprint.LinkNamedNode).map(node => new UiLinkDefinition(node));

    const inputQuery = getInputNodeQuery(inputNode);
    const outgoingLinkQueries = outLinkDefinitions.map(link => getOutgoingLinksQuery(inputNode, link));
    const incomingLinkQueries = inLinkDefinitions.map(link => getIncomingLinksQuery(inputNode, link));

    const query = sparqlUtils.mergeConstruct([inputQuery, ...outgoingLinkQueries, ...incomingLinkQueries, this.uiClassMetadataService.getClassMetadataSparqlQuery()])
    return query;
  }

}

function getInputNodeQuery(input: NamedNode): string {
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

function getOutgoingLinksQuery(input: NamedNode, link: UiLinkDefinition): string {
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

function getIncomingLinksQuery(input: NamedNode, link: UiLinkDefinition): string {
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
  #name : string | undefined = undefined;
  #propertyPath : string[] | undefined = undefined;

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

  get propertyPath(): string[] {
    if(this.#propertyPath == undefined){
      const paths = this._node.out(shacl.pathNamedNode);
      let path: GraphPointer;

      if(paths.values.length === 0){
        console.error(`No path found for link <${this._node.value}>`);
        this.#propertyPath = [];
      } else {
        if(paths.values.length > 1) {
          console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
        }
        path = paths.toArray()[0];

        if(path.isList()){
          const pathElement = [...path.list()].map(pathElement => this.#getPathElement(pathElement));
          this.#propertyPath = pathElement.includes(null) ? [] : pathElement;
        } else {
          const pathElement = this.#getPathElement(path);
          this.#propertyPath = pathElement === null ? [] : [pathElement];
      }
    }
  }
    return this.#propertyPath;
  }

  get inversePropertyPath(): string[] {
    const path = this.propertyPath;
    return path.map(pathElement => { 
      if (pathElement.startsWith(`^<)`) ) {
        return pathElement.replace(`^<`, `<`);
      }
      return `^${pathElement}`;
    });
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

  #getPathElement(node: GraphPointer): string | null {
    if (node.term.termType === 'NamedNode') {
      return `<${node.value}>`;
    }
    if (node.term.termType === 'BlankNode') {
      const inversePath = this.#getInversePathElement(node);
      return inversePath;
    }
    console.error(`Invalid path element found for link <${this._node.value}>`);
    return null;
  }

  #getInversePathElement(node: GraphPointer): string | null {
    const inversePath = node.out(shacl.inversePathNamedNode);
    if (inversePath.values.length === 0) {
      console.error(`No inverse path found for link <${this._node.value}>`);
      return null;
    }
    if (inversePath.values.length > 1) {
        console.warn(`Multiple inverse paths found for link <${this._node.value}>. Using the first one.`);
    }
    return `^<${inversePath[0].value}>`;
  }
}