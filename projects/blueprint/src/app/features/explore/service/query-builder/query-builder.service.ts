import { Injectable, inject } from '@angular/core';

import { Observable, forkJoin, map, switchMap, of } from 'rxjs';


import { rdf, flux, shacl, rdfs, schema, skos } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';

import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { sparqlUtils } from 'projects/blueprint/src/app/core/utils/sparql-utils';
import { getAllObjectPropertiesForIriQuery } from './query/get-all-object-properties-for-iri.query';
import { RdfUiLinkDefinition, UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { link } from 'fs';


@Injectable({
  providedIn: 'root',
})
export class QueryBuilderService {
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
    const outObjectPredicates = ClownfaceObject.getPredicatesForNode(rdfGraph.node(inputNode)).filter(p => p !== rdf.typeNamedNode.value);
    const inObjectPredicates = rdfGraph.node(inputNode).in().map(n => ClownfaceObject.getPredicatesForNode(n)).flat().filter(p => p !== rdf.typeNamedNode.value);
    console.log('inObjectPredicates', inObjectPredicates);
    const inputNodeTypes = rdfGraph.node(inputNode).out(rdf.typeNamedNode).values;
    const outLinkDefinitions = linkDefinitions.filter(linkDefinition => inputNodeTypes.includes(linkDefinition.arrowSource));
    const inLinkDefinitions = linkDefinitions.filter(linkDefinition => inputNodeTypes.includes(linkDefinition.arrowTarget));


    // remove object predicates that are already in the link definitions
    outLinkDefinitions.forEach(link => {
      const linkPropertyPath = link.propertyPath;
      // Regex to match the first element of a SPARQL property path
      // Matches <...> or a prefixed name (e.g., schema:employee)
      const match = linkPropertyPath.match(/^(\s*<[^>]+>\s*|\s*[a-zA-Z_][\w\-]*:[\w\-]+\s*)/);
      const firstElementOfPath = match ? match[1].trim() : null;
      // remove first and last character from the path (< and >) and remove it from the object predicates if it exists
      if (firstElementOfPath && firstElementOfPath.length > 2) {
        const trimmedPredicate = firstElementOfPath.substring(1, firstElementOfPath.length - 1);
        if (outObjectPredicates.includes(trimmedPredicate)) {
          const index = outObjectPredicates.indexOf(trimmedPredicate);
          if (index > -1) {
            outObjectPredicates.splice(index, 1);
          }
        }
      }
    });

    inLinkDefinitions.forEach(link => {
      const linkPropertyPath = link.inversePropertyPath;
      // Regex to match the first element of a SPARQL property path
      // Matches <...> or a prefixed name (e.g., schema:employee)
      const match = linkPropertyPath.match(/^(\s*<[^>]+>\s*|\s*[a-zA-Z_][\w\-]*:[\w\-]+\s*)/);
      const firstElementOfPath = match ? match[1].trim() : null;
      // remove first and last character from the path (< and >) and remove it from the object predicates if it exists
      if (firstElementOfPath && firstElementOfPath.length > 2) {
        const trimmedPredicate = firstElementOfPath.substring(1, firstElementOfPath.length - 1);
        if (outObjectPredicates.includes(trimmedPredicate)) {
          const index = outObjectPredicates.indexOf(trimmedPredicate);
          if (index > -1) {
            outObjectPredicates.splice(index, 1);
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
      console.log('tragetTypes', tragetTypes);
      // check if one of the target types is in the class definitions
      const isTargetTypeInClassDefinitions = tragetTypes.some(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
      if (isTargetTypeInClassDefinitions) {
        // change order of tragetTypes the ones with classDefinitioins first
        const targetTypesWithClassDefinitions = tragetTypes.filter(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
        const targetTypesWithoutClassDefinitions = tragetTypes.filter(type => !classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
        tragetTypes = [...targetTypesWithClassDefinitions, ...targetTypesWithoutClassDefinitions];
      }

      const ttl = `
@prefix vorlon: <https://vorlon.described.at/ontology#> .
@prefix blueprintShape: <https://ld.flux.zazuko.com/shapes/metadata/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix flux: <https://flux.described.at/> .
@prefix : <http://localhost:7001/> .
@prefix schema: <http://schema.org/> .

  <${input}/${bracketLessPredicate}/synthetic> a flux:Link ;
   sh:targetClass <${sourceTypes[0]}> ;
   sh:class <${rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values[0]}> ;
   sh:name "${label}" ;
   sh:path <${predicate}> .


      `;
      dataset.addAll(rdfEnvironment.parseTurtle(ttl));
      const syntheticLink = rdfEnvironment.clownface(dataset).namedNode(`${input}/${bracketLessPredicate}/synthetic`).map(l => new RdfUiLinkDefinition(l));
      return syntheticLink;
    }
    );

    outLinkDefinitions.push(...syntheticLinksOut);
    linkDefinitions.push(...syntheticLinksOut);
    /*
        const syntheticLinksIn = outObjectPredicates.flatMap(predicate => {
          const bracketLessPredicate = predicate.replace(/^https?:\/\//, '');
          // Extract label from predicate: last part after '/' or '#'
          const labelMatch = predicate.match(/([^\/#]+)$/);
          const label = labelMatch ? labelMatch[1] : predicate;
          const tragetTypes = rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values;
          // check if one of the target types is in the class definitions
          const isTargetTypeInClassDefinitions = tragetTypes.some(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
           if (!isTargetTypeInClassDefinitions) {
             return [];
           }
             
          const ttl = `
    @prefix vorlon: <https://vorlon.described.at/ontology#> .
    @prefix blueprintShape: <https://ld.flux.zazuko.com/shapes/metadata/> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix flux: <https://flux.described.at/> .
    @prefix : <http://localhost:7001/> .
    @prefix schema: <http://schema.org/> .
    
      <${input}/${bracketLessPredicate}/synthetic> a flux:Link ;
       sh:targetClass <${sourceTypes[0]}> ;
       sh:class <${rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values[0]}> ;
       sh:name "${label}" ;
       sh:path <${predicate}> .
    
    
          `;
          console.log(ttl);
          dataset.addAll(rdfEnvironment.parseTurtle(ttl));
          const syntheticLink = rdfEnvironment.clownface(dataset).namedNode(`${input}/${bracketLessPredicate}/synthetic`).map(l => new RdfUiLinkDefinition(l));
          return syntheticLink;
        }
        );
    */
    // create sub queries
    const inputQuery = getInputNodeQuery(inputNode);
    const outgoingLinkQueries = outLinkDefinitions.filter(link => link.propertyPath !== null).map(link => getOutgoingLinksQuery(inputNode, link));
    const incomingLinkQueries = inLinkDefinitions.filter(link => link.inversePropertyPath !== null).map(link => getIncomingLinksQuery(inputNode, link));

    outgoingLinkQueries.forEach(query => {
      console.log('outgoingLinkQueries', query);
    });
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
  return `
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
  BIND (<${link.arrowTarget}> as ?targetType)
  ?input ${link.propertyPath}  ?target .
  ?target a ?targetType .
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
  BIND (<${link.arrowSource}> as ?targetType)
  BIND (${flux.UiNodePrefixed} as ?fluxUiType)
  ?target ${link.propertyPath}  ?input  .
  ?target a ?targetType .
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
