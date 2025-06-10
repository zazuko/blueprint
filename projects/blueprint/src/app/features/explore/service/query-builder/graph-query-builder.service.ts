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
import { PredicateTBox } from 'projects/blueprint/src/app/core/rdf/semantics/predicate-t-box';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { TBoxService } from 'projects/blueprint/src/app/core/rdf/semantics/service/tbox.service';
import { ConfigService } from '@blueprint/service/config/config.service';


@Injectable({
  providedIn: 'root',
})
export class GraphQueryBuilderService {
  readonly #sparqlService = inject(SparqlService);
  readonly #uiClassMetadataService = inject(UiClassMetadataService);
  readonly #uiLinkMetadataService = inject(UiLinkMetadataService);
  readonly #tBoxService = inject(TBoxService);

  readonly #appConfig = inject(ConfigService);

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
    const appLinkConfiguration = this.#appConfig.getConfiguration().ui.linkConfiguration;

    this.#tBoxService.addPredicateTBoxes(dataset);
    const inputNode = rdfEnvironment.namedNode(input);
    const rdfGraph = rdfEnvironment.clownface(dataset);

    const allSourceTypes = rdfGraph.node(inputNode).out(rdf.typeNamedNode).values;
    const sourceTypes = allSourceTypes.filter(type => classDefinitions.some(classDefinition => classDefinition.targetNode.value === type));
    const outObjectPredicates = [... new Set([...dataset.match(inputNode, null, null)].filter(q => q.object.termType === 'NamedNode' || q.object.termType === "BlankNode").filter(q => !q.predicate.equals(rdf.typeNamedNode)).map(q => q.predicate.value))];
    const inObjectPredicates = [...new Set([...dataset.match(null, null, inputNode)].filter(q => !q.predicate.equals(rdfEnvironment.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'))).map(q => q.predicate.value))];

    const inputNodeTypes = rdfGraph.node(inputNode).out(rdf.typeNamedNode).values;
    const appOutLinkDefinitions = linkDefinitions.filter(linkDefinition => inputNodeTypes.includes(linkDefinition.arrowSource));
    const appInLinkDefinitions = linkDefinitions.filter(linkDefinition => inputNodeTypes.includes(linkDefinition.arrowTarget));

    if (appLinkConfiguration === 'both') {
      // remove object predicates that are already in the link definitions
      appOutLinkDefinitions.forEach(link => {
        const firstElementOfPath = link.propertyPathFragments[0];

        // remove first and last character from the path (< and >) and remove it from the object predicates if it exists
        if (firstElementOfPath && firstElementOfPath.length > 2) {
          if (firstElementOfPath.startsWith('<')) {
            const trimmedPredicate = firstElementOfPath.substring(1, firstElementOfPath.length - 1);
            if (outObjectPredicates.includes(trimmedPredicate)) {
              const index = outObjectPredicates.indexOf(trimmedPredicate);
              if (index > -1) {
                outObjectPredicates.splice(index, 1);
              }
            }
          } else if (firstElementOfPath.startsWith('^')) {
            const trimmedPredicate = firstElementOfPath.substring(2, firstElementOfPath.length - 1);
            if (inObjectPredicates.includes(trimmedPredicate)) {
              const index = inObjectPredicates.indexOf(trimmedPredicate);
              if (index > -1) {
                inObjectPredicates.splice(index, 1);
              }
            }
          }
        }
      });

      appInLinkDefinitions.forEach(link => {
        const firstElementOfPath = link.inversePropertyPathFragments[0];

        // remove first and last character from the path (< and >) and remove it from the object predicates if it exists
        if (firstElementOfPath && firstElementOfPath.length > 2) {
          if (firstElementOfPath.startsWith('<')) {
            const trimmedPredicate = firstElementOfPath.substring(1, firstElementOfPath.length - 1);
            if (outObjectPredicates.includes(trimmedPredicate)) {
              const index = outObjectPredicates.indexOf(trimmedPredicate);
              if (index > -1) {
                outObjectPredicates.splice(index, 1);
              }
            }
          } else if (firstElementOfPath.startsWith('^')) {
            const trimmedPredicate = firstElementOfPath.substring(2, firstElementOfPath.length - 1);
            if (inObjectPredicates.includes(trimmedPredicate)) {
              const index = inObjectPredicates.indexOf(trimmedPredicate);
              if (index > -1) {
                inObjectPredicates.splice(index, 1);
              }
            }
          }
        }
      });
    }
    // create synthetic links for object predicates
    const syntheticLinksOut = outObjectPredicates.flatMap(predicate => {
      const bracketLessPredicate = predicate.replace(/^https?:\/\//, '');
      const tBoxPtr = rdfGraph.namedNode(predicate);
      let tBox: PredicateTBox | undefined = undefined;
      if (tBoxPtr.value) {
        // Check if the predicate is a TBox
        tBox = new PredicateTBox(tBoxPtr);
      }

      let label = '';
      if (tBox && tBox.label) {
        label = tBox.label;
      } else {
        // Extract label from predicate: last part after '/' or '#'
        const labelMatch = predicate.match(/([^\/#]+)$/);
        label = labelMatch ? labelMatch[1] : predicate;

      }
      let tragetTypes = rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values;

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
${appLocal.turtlePrefix()}
  <${predicate}/link/synthetic> a flux:Link ;
   sh:targetClass <${sourceTypes[0]}> ;
   sh:class <${rdfGraph.node(inputNode).out(rdfEnvironment.namedNode(predicate)).out(rdf.typeNamedNode).values[0]}> ;
   sh:name "${label}" ;
   ${appLocal.isSyntheticPrefixed} true ;
   sh:path <${predicate}> .


      `;
      dataset.addAll(rdfEnvironment.parseTurtle(ttl));
      const syntheticLinkPtr = rdfEnvironment.clownface(dataset).namedNode(`${predicate}/link/synthetic`);
      const syntheticLink = new RdfUiLinkDefinition(syntheticLinkPtr);

      return syntheticLink;
    }
    );

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



    const outLinkDefinitions: UiLinkDefinition[] = [];
    if (appLinkConfiguration === 'app' || appLinkConfiguration === 'both') {
      outLinkDefinitions.push(...appOutLinkDefinitions);
    };
    if (appLinkConfiguration === 'rdf' || appLinkConfiguration === 'both') {
      outLinkDefinitions.push(...syntheticLinksOut);
      linkDefinitions.push(...syntheticLinksOut);
    }

    const inLinkDefinitions: UiLinkDefinition[] = [];
    if (appLinkConfiguration === 'app' || appLinkConfiguration === 'both') {
      inLinkDefinitions.push(...appInLinkDefinitions);
    };
    if (appLinkConfiguration === 'rdf' || appLinkConfiguration === 'both') {
      inLinkDefinitions.push(...syntheticLinksIn);
      linkDefinitions.push(...syntheticLinksIn);

    }

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
  const query = `
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

  return query;
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
