import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import rdfEnvironment from '@zazuko/env';

import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { sparqlUtils } from '@blueprint/utils';

import { blueprint, rdf } from '@blueprint/ontology';
import { HierarchyDefinition } from './model/hierarchy-definition.model';
import { hierarchyByIriQuery } from './query/hierarchy-by-iri.query';
import { hierarchyForClassQuery } from './query/hierarchy-for-class.query';
import { allHierarchiesQuery } from './query/all-hierarchy.query';

@Injectable({
    providedIn: 'root'
})
export class HierarchyService {

    readonly #sparqlService = inject(SparqlService);
    readonly #uiClassMetadataService = inject(UiClassMetadataService);

    /**
     * Get the hierarchy definition for a specific IRI
     * 
     * @param iri Returns the hierarchy definition for this IRI
     * @returns Observable of the hierarchy definition
     */
    getHierarchyDefinitionByIri(iri: string): Observable<HierarchyDefinition | null> {
        const classMetadataQuery = this.#uiClassMetadataService.getClassMetadataSparqlQuery();
        const hierarchyQuery = hierarchyByIriQuery(iri);
        return this.#sparqlService.construct(sparqlUtils.mergeConstruct([classMetadataQuery, hierarchyQuery])).pipe(
            map((dataset) => {
                const hierarchyGraph = rdfEnvironment.clownface({ dataset }).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
                if (hierarchyGraph.values.length !== 1) {
                    return null;
                }
                const hierarchies = hierarchyGraph.map(hierarchyCfNode => {
                    const hierarchyNode = rdfEnvironment.namedNode(hierarchyCfNode.value);
                    return new HierarchyDefinition(hierarchyNode, dataset)
                })
                return hierarchies[0];
            })
        );
    }

    /**
     * Get all hierarchies for a specific class
     * 
     * @param iri the class IRI
     * @returns an Observable of all hierarchies for the class
     */
    getHierarchiesForClass(iri: string): Observable<HierarchyDefinition[]> {
        const classMetadataQuery = this.#uiClassMetadataService.getClassMetadataSparqlQuery();
        const hierarchyQuery = hierarchyForClassQuery(iri);


        return this.#sparqlService.construct(sparqlUtils.mergeConstruct([classMetadataQuery, hierarchyQuery])).pipe(
            map((dataset) => {
                const hierarchyGraph = rdfEnvironment.clownface({ dataset }).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
                const hierarchies = hierarchyGraph.map(hierarchyCfNode => {
                    const hierarchyNode = rdfEnvironment.namedNode(hierarchyCfNode.value);
                    return new HierarchyDefinition(hierarchyNode, dataset)
                })
                return hierarchies;
            })
        );
    }

    /**
     * Get all available hierarchies
     * 
     * @returns an Observable of all hierarchies
     */
    getAllHierarchies(): Observable<HierarchyDefinition[]> {
        const classMetadataQuery = this.#uiClassMetadataService.getClassMetadataSparqlQuery();
        const hierarchyQuery = allHierarchiesQuery();

        return this.#sparqlService.construct(sparqlUtils.mergeConstruct([classMetadataQuery, hierarchyQuery])).pipe(
            map((dataset) => {
                const hierarchyGraph = rdfEnvironment.clownface({ dataset }).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
                const hierarchies = hierarchyGraph.map(hierarchyCfNode => {
                    const hierarchyNode = rdfEnvironment.namedNode(hierarchyCfNode.value);
                    return new HierarchyDefinition(hierarchyNode, dataset)
                })
                return hierarchies;
            })
        );
    }

    /**
     * Returns the SPARQL query to get all hierarchies
     * 
     * @returns SPARQL query to get all hierarchies
     */
    getAllHierarchiesQuery(): string {
        return allHierarchiesQuery();
    }

    /**
     * Returns the SPARQL query to get the hierarchy for a specific class
     * 
     * @param iri The IRI of the class
     * @returns SPARQL query to get the hierarchy for a specific class
     */
    getHierarchiesForClassQuery(iri: string): string {
        return hierarchyForClassQuery(iri);
    }

}
