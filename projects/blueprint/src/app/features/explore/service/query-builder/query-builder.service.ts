import { Injectable, inject } from '@angular/core';

import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import rdfEnvironment from '@zazuko/env';
import { Dataset, NamedNode } from '@rdfjs/types';

import { MultiPointer } from 'clownface';
import { toSparql } from 'clownface-shacl-path';


import { rdf, blueprint, shacl, rdfs } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';
import { sparqlUtils } from '@blueprint/utils';
import { UiLinkMetadata } from '@blueprint/model/ui-link-metadata/ui-link-metadata';


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
    const query = sparqlUtils.mergeConstruct([uiMetaDataQuery, linkMetaDataQuery]);

    // Execute the merged query to retrieve link metadata
    return this.sparqlService.construct(query).pipe(
      switchMap(linkMetaDataset => {
        // Add the link metadata to the RDF dataset
        dataset.addAll(linkMetaDataset);
        // Build the SPARQL query strings from the retrieved metadata
        const queryStrings = this._buildQueryFromMetaModel(input, linkMetaDataset);

        // Execute the query strings to retrieve the final results
        return this.sparqlService.construct(queryStrings);
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
    const outgoingLinks = metaGraph
      .namedNode(inputNode)
      .out(rdf.typeNamedNode)
      .in(shacl.targetClassNamedNode).has(rdf.typeNamedNode, blueprint.LinkNamedNode);

    const incomingLinks = metaGraph
      .namedNode(inputNode)
      .out(rdf.typeNamedNode)
      .in(shacl.classNamedNode).has(rdf.typeNamedNode, blueprint.LinkNamedNode);


    const linksAndPropertyPath: LinkAndPath[] = [];

    outgoingLinks.forEach((outLink) => {
      const link = new UiLinkMetadata(outLink);
      linksAndPropertyPath.push({
        link: rdfEnvironment.namedNode(outLink.value),
        targetClass: link.destination,
        propertyPath: this._listToPropertyPath(link.path),
        isInverse: false,
      });
    });

    incomingLinks.forEach((inLink) => {
      const link = new UiLinkMetadata(inLink);
      linksAndPropertyPath.push({
        link: rdfEnvironment.namedNode(inLink.value),
        targetClass: link.source,
        propertyPath: this._listToPropertyPath(link.path),
        isInverse: true,
      });
    });
    const inputQuery = getInputNodeQuery(inputNode);
    const outgoingLinkQueries = linksAndPropertyPath.map(l => {
      if (l.isInverse) {
        return getIncomingLinksQuery(inputNode, l)
      }
      return getOutgoingLinksQuery(inputNode, l)
    })
    const query = sparqlUtils.mergeConstruct([inputQuery, ...outgoingLinkQueries, this.uiClassMetadataService.getClassMetadataSparqlQuery()])
    return query;
  }

  private _listToPropertyPath(path: MultiPointer): string {
    return toSparql(path).toString({ prologue: false, })
  }

}

interface LinkAndPath {
  link: NamedNode;
  targetClass: string,
  propertyPath: string;
  isInverse: boolean;
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

function getOutgoingLinksQuery(input: NamedNode, link: LinkAndPath): string {
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
  BIND (<${link.link.value}> as ?link)
  BIND (${blueprint.UiNodePrefixed} as ?fluxUiType)
  BIND (<${link.targetClass}> as ?targetType)
  ?input ${link.propertyPath}  ?target .
  ?target a ?targetType .
  ?target ${rdfs.labelPrefixed} ?targetLabel .
  # get the link label
  ?link ${shacl.namePrefixed} ?linkLabel . 
  
  # create a unique iri for the link (reification)
  BIND(IRI(CONCAT(STR(?link), '/', MD5(STR(?input)), '/', MD5(STR(?target)))) as ?linkIri )
}
`;
}

function getIncomingLinksQuery(input: NamedNode, link: LinkAndPath): string {
  return `
  ${shacl.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}
  PREFIX schema: <http://schema.org/>

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
  BIND (<${link.link.value}> as ?link)
  BIND (<${link.targetClass}> as ?targetType)
  BIND (${blueprint.UiNodePrefixed} as ?fluxUiType)
  ?target ${link.propertyPath}  ?input  .
  ?target a ?targetType .
  ?target ${rdfs.labelPrefixed} ?targetLabel .
  # get the link label
  ?link ${shacl.namePrefixed} ?linkLabel . 
  
  # create a unique iri for the link (reification)
  BIND(IRI(CONCAT(STR(?link), '/', MD5(STR(?input)), '/', MD5(STR(?target)))) as ?linkIri )
}
`;
}