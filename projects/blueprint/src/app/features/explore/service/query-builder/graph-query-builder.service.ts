import { Injectable, inject } from '@angular/core';

import { Observable, forkJoin, switchMap, of } from 'rxjs';

import { rdf, flux, shacl, rdfs, schema, skos, appLocal } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';

import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { sparqlUtils } from 'projects/blueprint/src/app/core/utils/sparql-utils';
import { getAllObjectPropertiesForIriQuery } from './query/get-all-object-properties-for-iri.query';
import { RdfUiLinkDefinition, UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';


@Injectable({
  providedIn: 'root',
})
export class GraphQueryBuilderService {
  readonly #sparqlService = inject(SparqlService);
  readonly #uiClassMetadataService = inject(UiClassMetadataService);
  readonly #uiLinkMetadataService = inject(UiLinkMetadataService);

  /**
  * Builds a SPARQL query based on the input string.
  * 
  * @param input The input string to build the query from.
  * @returns An Observable that emits a Dataset containing the results of the query.
  */
  public buildQuery(input: string): Observable<{ data: RdfTypes.Dataset; linkDefinitions: UiLinkDefinition[]; classDefinitions: UiClassMetadata[]; }> {
    const dataset = rdfEnvironment.dataset();

    // Get the SPARQL queries for retrieving UI and link metadata
    const uiMetaDataQuery = this.#uiClassMetadataService.getClassMetadataSparqlQuery();
    //  const linkMetaDataQuery = this.#uiLinkMetadataService.getLinkMetadataSparqlQueryForNode(input);
    const objectPropertiesQuery = getAllObjectPropertiesForIriQuery(input);
    // Merge the UI and link metadata queries into a single query
    const mergedQuery = sparqlUtils.mergeConstruct([uiMetaDataQuery, objectPropertiesQuery]);

    // Execute the merged query to retrieve link metadata
    return forkJoin({ data: this.#sparqlService.construct(mergedQuery), linkDefinition: this.#uiLinkMetadataService.getLinkMetadata(), classDefinition: this.#uiClassMetadataService.getClassMetadata() }).pipe(
      switchMap(response => {
        // Add the link metadata to the RDF dataset
        dataset.addAll(response.data);
        // Build the SPARQL query strings from the retrieved metadata
        const getLinksQuery = this._buildQueryFromMetaModel(input, response.data, response.linkDefinition, response.classDefinition);

        // Execute the query strings to retrieve the final results
        return getLinksQuery
      })
    );
  }

  private _buildQueryFromMetaModel(
    input: string,
    dataset: RdfTypes.Dataset,
    linkDefinitions: UiLinkDefinition[],
    classDefinitions: UiClassMetadata[]
  ): Observable<{ data: RdfTypes.Dataset; linkDefinitions: UiLinkDefinition[]; classDefinitions: UiClassMetadata[]; }> {

    const inputNode = rdfEnvironment.namedNode(input);
    const rdfGraph = rdfEnvironment.clownface(dataset);

    const allSourceTypes = rdfGraph.node(inputNode).out(rdf.typeNamedNode).values;
    const sourceTypes = allSourceTypes.filter(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
    const outObjectPredicates = [... new Set([...dataset.match(inputNode, null, null)].filter(q => q.object.termType === 'NamedNode' || q.object.termType === "BlankNode").filter(q => !q.predicate.equals(rdf.typeNamedNode)).map(q => q.predicate.value))];
    const inObjectPredicates = [...new Set([...dataset.match(null, null, inputNode)].filter(q => !q.predicate.equals(rdfEnvironment.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'))).map(q => q.predicate.value))];

    const inputNodeTypes = rdfGraph.node(inputNode).out(rdf.typeNamedNode).values;
    const outLinkDefinitions = linkDefinitions.filter(linkDefinition => inputNodeTypes.includes(linkDefinition.arrowSource));
    const inLinkDefinitions = linkDefinitions.filter(linkDefinition => inputNodeTypes.includes(linkDefinition.arrowTarget));

    console.log('%coutObjectPredicates', 'color:blue', outObjectPredicates);
    console.log('%cinObjectPredicates', 'color:green', inObjectPredicates);
    // remove object predicates that are already in the link definitions
    outLinkDefinitions.forEach(link => {
      const firstElementOfPath = link.propertyPathFragments[0];
      console.log('%casdfasdf', 'color:magenta', firstElementOfPath);

      // remove first and last character from the path (< and >) and remove it from the object predicates if it exists
      if (firstElementOfPath && firstElementOfPath.length > 2) {
        if (firstElementOfPath.startsWith('<')) {
          const trimmedPredicate = firstElementOfPath.substring(1, firstElementOfPath.length - 1);
          if (outObjectPredicates.includes(trimmedPredicate)) {
            const index = outObjectPredicates.indexOf(trimmedPredicate);
            if (index > -1) {
              console.log('%cout link remove', 'color:blue', trimmedPredicate, ' from outObjectPredicates', outObjectPredicates);
              outObjectPredicates.splice(index, 1);
            }
          }
        } else if (firstElementOfPath.startsWith('^')) {
          const trimmedPredicate = firstElementOfPath.substring(2, firstElementOfPath.length - 1);
          if (inObjectPredicates.includes(trimmedPredicate)) {
            const index = inObjectPredicates.indexOf(trimmedPredicate);
            if (index > -1) {
              console.log('%cout link remove', 'color:green', trimmedPredicate, ' from inObjectPredicates', inObjectPredicates);

              inObjectPredicates.splice(index, 1);
            }
          }
        }
      }
    });

    inLinkDefinitions.forEach(link => {
      const firstElementOfPath = link.inversePropertyPathFragments[0];

      // remove first and last character from the path (< and >) and remove it from the object predicates if it exists
      if (firstElementOfPath && firstElementOfPath.length > 2) {
        console.log('%cin link what todo ? firstElementOfPath', 'color: green', firstElementOfPath);
        if (firstElementOfPath.startsWith('<')) {
          const trimmedPredicate = firstElementOfPath.substring(1, firstElementOfPath.length - 1);
          if (outObjectPredicates.includes(trimmedPredicate)) {
            const index = outObjectPredicates.indexOf(trimmedPredicate);
            if (index > -1) {
              console.log('%cout link remove', 'color:green', trimmedPredicate, ' from outObjectPredicates', outObjectPredicates);
              outObjectPredicates.splice(index, 1);
            }
          }
        } else if (firstElementOfPath.startsWith('^')) {
          const trimmedPredicate = firstElementOfPath.substring(2, firstElementOfPath.length - 1);
          if (inObjectPredicates.includes(trimmedPredicate)) {
            const index = inObjectPredicates.indexOf(trimmedPredicate);
            if (index > -1) {
              console.log('%cout link remove', 'color:blue', trimmedPredicate, ' from inObjectPredicates', inObjectPredicates);
              inObjectPredicates.splice(index, 1);
            }
          }
        }
      }
    });

    // create synthetic links for object predicates
    const syntheticLinksOut = outObjectPredicates.flatMap(predicate => {
      const bracketLessPredicate = predicate.replace(/^https?:\/\//, '');
      // Extract label from predicate: last part after '/' or '#'
      const labelMatch = predicate.match(/([^\/#]+)$/);
      const label = labelMatch ? labelMatch[1] : predicate;
      let tragetTypes = rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values;

      // check if one of the target types is in the class definitions
      const isTargetTypeInClassDefinitions = tragetTypes.some(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
      if (isTargetTypeInClassDefinitions) {
        // change order of tragetTypes the ones with classDefinitioins first
        const targetTypesWithClassDefinitions = tragetTypes.filter(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
        const targetTypesWithoutClassDefinitions = tragetTypes.filter(type => !classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
        tragetTypes = [...targetTypesWithClassDefinitions, ...targetTypesWithoutClassDefinitions];
      }
      console.log('%ctragetTypes', 'color: red', bracketLessPredicate, predicate);
      const ttl = `
@prefix vorlon: <https://vorlon.described.at/ontology#> .
@prefix blueprintShape: <https://ld.flux.zazuko.com/shapes/metadata/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix flux: <https://flux.described.at/> .
@prefix : <http://localhost:7001/> .
@prefix schema: <http://schema.org/> .
${appLocal.turtlePrefix()}
  <${predicate}/link/synthetic> a flux:Link ;
   sh:targetClass <${sourceTypes[0]}> ;
   sh:class <${rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values[0]}> ;
   sh:name "${label}" ;
   ${appLocal.isSyntheticPrefixed} true ;
   sh:path <${predicate}> .


      `;
      dataset.addAll(rdfEnvironment.parseTurtle(ttl));
      const syntheticLink = rdfEnvironment.clownface(dataset).namedNode(`${predicate}/link/synthetic`).map(l => new RdfUiLinkDefinition(l));
      return syntheticLink;
    }
    );



    outLinkDefinitions.push(...syntheticLinksOut);
    linkDefinitions.push(...syntheticLinksOut);

    // create synthetic in links for object predicates
    const syntheticLinksIn = inObjectPredicates.flatMap(predicate => {
      const bracketLessPredicate = predicate.replace(/^https?:\/\//, '');
      // Extract label from predicate: last part after '/' or '#'
      const labelMatch = predicate.match(/([^\/#]+)$/);
      const label = labelMatch ? labelMatch[1] : predicate;
      let tragetTypes = rdfGraph.node(inputNode).in(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values;

      // check if one of the target types is in the class definitions
      const isTargetTypeInClassDefinitions = tragetTypes.some(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
      if (isTargetTypeInClassDefinitions) {
        // change order of tragetTypes the ones with classDefinitioins first
        const targetTypesWithClassDefinitions = tragetTypes.filter(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
        const targetTypesWithoutClassDefinitions = tragetTypes.filter(type => !classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
        tragetTypes = [...targetTypesWithClassDefinitions, ...targetTypesWithoutClassDefinitions];
      }
      console.log('%cin tragetTypes', 'color: red', bracketLessPredicate, predicate);
      const ttl = `
@prefix vorlon: <https://vorlon.described.at/ontology#> .
@prefix blueprintShape: <https://ld.flux.zazuko.com/shapes/metadata/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix flux: <https://flux.described.at/> .
@prefix : <http://localhost:7001/> .
@prefix schema: <http://schema.org/> .
${appLocal.turtlePrefix()}
  <${predicate}/link/synthetic> a flux:Link ;
   sh:targetClass <${sourceTypes[0]}> ;
   sh:class <${rdfGraph.node(inputNode).in(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values[0]}> ;
   sh:name "${label}" ;
   ${appLocal.isSyntheticPrefixed} true ;
   sh:path <${predicate}> .


      `;
      dataset.addAll(rdfEnvironment.parseTurtle(ttl));
      const syntheticLink = rdfEnvironment.clownface(dataset).namedNode(`${predicate}/link/synthetic`).map(l => new RdfUiLinkDefinition(l));
      return syntheticLink;
    }
    );


    inLinkDefinitions.push(...syntheticLinksIn);
    linkDefinitions.push(...syntheticLinksIn);

    // create sub queries
    const inputQuery = getInputNodeQuery(inputNode);
    const outgoingLinkQueries = outLinkDefinitions.filter(link => link.propertyPath !== null).map(link => getOutgoingLinksQuery(inputNode, link));
    const incomingLinkQueries = inLinkDefinitions.filter(link => link.inversePropertyPath !== null).map(link => getIncomingLinksQuery(inputNode, link));



    // merge all queries into one
    const query = sparqlUtils.mergeConstruct([inputQuery, ...outgoingLinkQueries, ...incomingLinkQueries, this.#uiClassMetadataService.getClassMetadataSparqlQuery()])
    return forkJoin({ data: this.#sparqlService.construct(query), linkDefinitions: of(linkDefinitions), classDefinitions: of(classDefinitions) });
  }

}

function getInputNodeQuery(input: RdfTypes.NamedNode): string {
  return `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${flux.sparqlPrefix()}
${schema.sparqlPrefix()}
${skos.sparqlPrefix()}

CONSTRUCT {
  ?input ${rdfs.labelPrefixed} ?inputObject .
  ?input ${schema.namePrefixed} ?targetName .
  ?input ${skos.prefLabelPrefixed} ?skowPrefLabel .
  ?input ${schema.familyNamePrefixed} ?familyName .
  ?input a ?inputClass .
} WHERE {
  BIND (<${input.value}> as ?input)
 OPTIONAL {
    ?input ${rdfs.labelPrefixed} ?targetLabel .
  }
  OPTIONAL {
    ?input ${schema.namePrefixed} ?targetName .
  }
  OPTIONAL {
    ?input ${skos.prefLabelPrefixed} ?skowPrefLabel .
  }
  OPTIONAL {
    ?input ${schema.familyNamePrefixed} ?familyName .
  }  
  ?input ${rdf.typePrefixed} ?inputClass .
}
`;
}

function getOutgoingLinksQuery(input: RdfTypes.NamedNode, link: UiLinkDefinition): string {
  const query = `
  ${shacl.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${flux.sparqlPrefix()}
  ${schema.sparqlPrefix()}
  ${skos.sparqlPrefix()}

CONSTRUCT {
  ?input a ?fluxUiType .
  ?input ${flux.hasUiLinkPrefixed} ?linkIri .
  ?linkIri ${flux.linkPrefixed} ?link ;
    ${flux.linkLabelPrefixed} ?linkLabel ;
    ${flux.hasUiLinkPrefixed} ?target .
  # Get type of the target node
  ?target a ?targetType .
  ?target a ?fluxUiType.
  ?target ${rdfs.labelPrefixed} ?targetLabel.
  ?target ${schema.namePrefixed} ?targetName .
  ?target ${skos.prefLabelPrefixed} ?skowPrefLabel .
  ?target ${schema.familyNamePrefixed} ?familyName .
} WHERE {
  BIND (<${input.value}> as ?input)
  BIND (<${link.iri}> as ?link)
  BIND (${flux.UiNodePrefixed} as ?fluxUiType)
  ${link.isSynthetic ? `` : `BIND (<${link.arrowTarget}> as ?targetType)`}
  OPTIONAL {
    ?target a ?targetType .
  }  
  ?input ${link.propertyPath}  ?target .
  FILTER (!isLiteral(?target))
  FILTER (!isBlank(?target))

  OPTIONAL {
  ?target ${rdfs.labelPrefixed} ?targetLabel .
  }
  OPTIONAL {
  ?target ${schema.namePrefixed} ?targetName .
  }
  OPTIONAL {
    ?target ${skos.prefLabelPrefixed} ?skowPrefLabel .
  }
  OPTIONAL {
    ?target ${schema.familyNamePrefixed} ?familyName .
  }
  BIND ("${link.label}" as ?linkLabel) .
  
  # create a unique iri for the link (reification)
  BIND(IRI(CONCAT(STR(?link), MD5(STR(?input)), '/', MD5(STR(?target)))) as ?linkIri )
}
`;

  console.log('%cgetOutgoingLinksQuery', 'color:blue', query);
  return query;
}

function getIncomingLinksQuery(input: RdfTypes.NamedNode, link: UiLinkDefinition): string {
  return `
  ${shacl.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${flux.sparqlPrefix()}
  ${schema.sparqlPrefix()}
  ${skos.sparqlPrefix()}

CONSTRUCT {
  ?input a ?fluxUiType .
  ?linkIri ${flux.linkPrefixed} ?link ;
    ${flux.linkLabelPrefixed} ?linkLabel ;
    ${flux.hasUiLinkPrefixed} ?input .
  # Get type of the target node
  ?target a ?targetType .
  ?target a ?fluxUiType.
  ?target ${rdfs.labelPrefixed} ?targetLabel.
  ?target ${schema.namePrefixed} ?targetName .
  ?target ${skos.prefLabelPrefixed} ?skowPrefLabel .
  ?target ${schema.familyNamePrefixed} ?familyName .
  ?target  ${flux.hasUiLinkPrefixed} ?linkIri .
} WHERE {
  BIND (<${input.value}> as ?input)
  BIND (<${link.iri}> as ?link)
  BIND (${flux.UiNodePrefixed} as ?fluxUiType)

  ${link.isSynthetic ? `` : `BIND (<${link.arrowSource}> as ?targetType)`}

  OPTIONAL {
    ?target a ?targetType .
  }
  ?target ${link.propertyPath}  ?input  .
  FILTER (!isLiteral(?target))
  FILTER (!isBlank(?target))

  OPTIONAL {
    ?target ${rdfs.labelPrefixed} ?targetLabel .
  }
  OPTIONAL {
    ?target ${schema.namePrefixed} ?targetName .
  }
  OPTIONAL {
    ?target ${skos.prefLabelPrefixed} ?skowPrefLabel .
  }
  OPTIONAL {
    ?target ${schema.familyNamePrefixed} ?familyName .
  }
  BIND ("${link.label}" as ?linkLabel) .
  
  # create a unique iri for the link (reification)
  BIND(IRI(CONCAT(STR(?link), MD5(STR(?target)), '/', MD5(STR(?input)))) as ?linkIri )
}
`;
}
