import { Injectable, inject } from '@angular/core';

import { Observable, forkJoin, switchMap, of, map } from 'rxjs';

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
import { getInputNodeGraphQuery } from './query/get-input-node-graph.query';
import { getOutgoingLinkQuery } from './query/get-outgoing-link.query';
import { getIncomingLinkQuery } from './query/get-incoming-link.query';


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
    const linkMetaDataQuery = this.#uiLinkMetadataService.getLinkMetadataSparqlQueryForNode(input);
    const objectPropertiesQuery = getAllObjectPropertiesForIriQuery(input);

    // Merge the UI and link metadata queries into a single query
    const mergedQuery = sparqlUtils.mergeConstruct([uiMetaDataQuery, objectPropertiesQuery, linkMetaDataQuery]);

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
    const inputQuery = getInputNodeGraphQuery(inputNode);
    const outgoingLinkQueries = outLinkDefinitions.filter(link => link.propertyPath !== null).map(link => getOutgoingLinkQuery(inputNode, link));
    const incomingLinkQueries = inLinkDefinitions.filter(link => link.inversePropertyPath !== null).map(link => getIncomingLinkQuery(inputNode, link));



    // merge all queries into one
    const query = sparqlUtils.mergeConstruct([inputQuery, ...outgoingLinkQueries, ...incomingLinkQueries, this.#uiClassMetadataService.getClassMetadataSparqlQuery()])
    console.log(sparqlUtils.mergeConstruct([inputQuery, ...outgoingLinkQueries, ...incomingLinkQueries]));
    const sparqlQuery = this.#sparqlService.construct(query).pipe(map(data => data.addAll(dataset)));
    return forkJoin({ data: sparqlQuery, linkDefinitions: of(linkDefinitions), classDefinitions: of(classDefinitions) });
  }

}
