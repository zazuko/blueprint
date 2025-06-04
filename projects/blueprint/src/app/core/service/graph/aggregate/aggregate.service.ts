import { Injectable } from '@angular/core';
import { flux, rdf, rdfs, shacl } from '@blueprint/ontology';


import { ICompositionToNodeLink } from './model/composition/composition-to-node-link';
import { ICompositionToCompositionLink } from './model/composition/composition-to-composition-link';
import { OutgoingCompositionToNodeLinkFactory } from './factory/composition-to-node-link-factory/outgoing-composition-to-node-link-factory';
import { IncomingCompositionToNodeLinkFactory } from './factory/composition-to-node-link-factory/incoming-composition-to-node-link-factory';
import { compositionToNodeLinksForClassQuery } from './query/composition-to-node-links-for-class.query';
import { compositionToCompositionLinksForClassQuery } from './query/composition-to-composition-links-for-class.query';
import { OutgoingCompositionToCompositionLinkFactory } from './factory/composition-to-composition-link-factory/outgoing-composition-to-composition-link-factory';
import { IncomingCompositionToCompositionLinkFactory } from './factory/composition-to-composition-link-factory/incoming-composition-to-composition-link-factory';
import { CompositionToNodeRootStrategy } from './strategy/composition-to-node/composition-to-node-root-strategy-strategy';
import { CompositionToNodeQueryStrategy } from './strategy/composition-to-node/composition-to-node-query-strategy';
import { CompositionToNodeConnectionPointStrategy } from './strategy/composition-to-node/composition-to-node-connection-point-strategy';
import { TargetNodeStrategy } from './strategy/composition-to-node/target-node-strategy';
import { CompositionToCompositionQueryStrategy } from './strategy/composition-to-compostion/composition-to-composition-query-strategy';
import { CompositionToCompositionRootOfSourceStrategy } from './strategy/composition-to-compostion/composition-to-composition-root-of-source-strategy';
import { rdfEnvironment, RdfTypes } from '../../../rdf/rdf-environment';
@Injectable({
    providedIn: 'root'
})
export class AggregateService {

    constructor() { }

    /**
     * 
     * @param type is the rdfs:Class IRI
     * @returns The SPARQL query to get the links between aggregates for the given class
     */
    getCompositionToCompositionLinksForClassQuery(type: string): string {
        return compositionToCompositionLinksForClassQuery(type);
    }

    /**
     * 
     * @param type is the rdfs:Class IRI
     * @returns The SPARQL query to get the links between an aggregate and a node for the given class
     */
    getAggregateToNodeLinkForClassQuery(type: string): string {
        return compositionToNodeLinksForClassQuery(type);
    }

    /**
     * These are the links between to aggregates. 
     * 
     * @param linkDataset the dataset containing the links
     * @param classIris the rdf:Class iris
     * @returns Links between aggregates for the given classes. With the right direction and labels (incoming links are inverted)
     */
    #extractCompositionToCompositionLinks(linkDataset: RdfTypes.Dataset, classIris: string[]): ICompositionToCompositionLink[] {
        const linkGraph = rdfEnvironment.clownface(linkDataset);

        const outLinks: ICompositionToCompositionLink[] = [];
        const outLinkFactory = new OutgoingCompositionToCompositionLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(shacl.targetClassNamedNode)
                .out(shacl.groupNamedNode)
                .in(shacl.targetClassNamedNode)
                .has(rdf.typeNamedNode, flux.CompositionToCompositionLinkNamedNode)
                .map(link => outLinkFactory.creteLink(link));
            outLinks.push(...links);
        });

        const inLinks: ICompositionToCompositionLink[] = [];
        const inLinkFactory = new IncomingCompositionToCompositionLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(shacl.targetClassNamedNode)
                .out(shacl.groupNamedNode)
                .in(flux.targetNamedNode)
                .has(rdf.typeNamedNode, flux.CompositionToCompositionLinkNamedNode)
                .map(link => inLinkFactory.creteLink(link));
            inLinks.push(...links);
        });

        return [...outLinks, ...inLinks];
    }

    /**
     * These are the links between an aggregate and a Node.
     * 
     * @param linkDataset the dataset containing the links
     * @param classIris the rdf:Class iris
     * @returns Links between aggregates and nodes for the given classes. With the right direction and labels (incoming links are inverted)
     */
    #extractCompositionToNodeLinks(linkDataset: RdfTypes.Dataset, classIris: string[]): ICompositionToNodeLink[] {
        const linkGraph = rdfEnvironment.clownface(linkDataset);

        const outLinks: ICompositionToNodeLink[] = [];
        const outLinkFactory = new OutgoingCompositionToNodeLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(shacl.targetClassNamedNode)
                .out(shacl.groupNamedNode)
                .in(shacl.targetClassNamedNode)
                .has(rdf.typeNamedNode, flux.CompositionToNodeLinkNamedNode)
                .map(link => outLinkFactory.creteLink(link));
            outLinks.push(...links);
        });


        const inLinks: ICompositionToNodeLink[] = [];
        const inLinkFactory = new IncomingCompositionToNodeLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(flux.targetNamedNode)
                .has(rdf.typeNamedNode, flux.CompositionToNodeLinkNamedNode)
                .map(link => inLinkFactory.creteLink(link));
            inLinks.push(...links);
        });

        return [...outLinks, ...inLinks];
    }

    /**
     * This method creates the SPARQL queries to get the links between aggregates for the given classes based on the given subject.
     * 
     * @param viewGraphMetadata The dataset containing the links
     * @param classIris all Class IRIs of the current subject
     * @param subject the subject IRI
     * @returns An array of SPARQL queries to get the links between an composition and another composition for the given classes
     */
    getCompositionToCompositionLinkQueries(viewGraphMetadata: RdfTypes.Dataset, classIris: string[], subject: string): string[] {
        const links = this.#extractCompositionToCompositionLinks(viewGraphMetadata, classIris);

        // strategies to create the queries
        const strategies: CompositionToCompositionQueryStrategy[] = [
            new CompositionToCompositionRootOfSourceStrategy(),
        ];

        const newQueries = strategies.flatMap(strategy => {
            const flitteredLinksForTheCurrentStrategy = strategy.filter(links, classIris);
            return flitteredLinksForTheCurrentStrategy.flatMap(link => strategy.createQuery(link, subject));
        });
        console.log(newQueries.join('\n\n\n\n'));


        const queries = links.flatMap(link => {
            const sourceComposition = link.sourceComposition;
            const targetComposition = link.targetComposition;

            if (sourceComposition === null || targetComposition === null) {
                console.warn('No source or target composition');
                return [];
            }

            const sourceRootNode = sourceComposition.aggregateNodes.find(node => node.iri === sourceComposition.rootIri);
            const isSourceRoot = classIris.includes(sourceRootNode?.targetClassIri);

            if (isSourceRoot) {
                const q = link.path.flatMap((path, outerIndex) => {
                    const firstPathElement = path[0];
                    const sourceConnectors = sourceComposition.connectionPoints.filter(connectorNode => connectorNode.targetClassIri === firstPathElement.sourceClassIri);
                    if (sourceConnectors.length === 0) {
                        console.warn(`No connection points for source ${sourceComposition.iri} with ${sourceComposition.rootIri, sourceComposition.rdfTypeIris}`, sourceComposition.connectionPoints);
                        return [];
                    }
                    const lastPathElement = path[path.length - 1];
                    const targetConnectors = targetComposition.connectionPoints.filter(connectorNode => connectorNode.targetClassIri === lastPathElement.targetClassIri);
                    if (targetConnectors.length === 0) {
                        console.warn('No connection points');
                        return [];
                    }

                    if (sourceConnectors.length > 1) {
                        console.warn('More than one source connector');
                        return [];
                    }

                    if (targetConnectors.length > 1) {
                        console.warn('More than one target connector');
                        return [];
                    }
                    const pathFromRootSource = sourceConnectors[0].pathFromRoot;
                    const pathToRootTarget = targetConnectors[0].pathToRoot;

                    const wholePath = [...pathFromRootSource, ...path, ...pathToRootTarget];
                    const body = wholePath.map((pathElement, index) => {
                        if (index === pathFromRootSource.length - 1) {
                            // this is the connection point on the source side
                            // root source composition ---> path in source composition -> source connection point -> destination connection point -> path in target composition (to root)
                            if (index === 0) {
                                return `
                                <${subject}> a <${pathElement.sourceClassIri}> .
                                <${subject}> ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                                ?element_${outerIndex}_${index + 1}  ${rdfs.labelPrefixed} ?connectionPointL .
                                ?element_${outerIndex}_${index + 1}  ${rdf.typePrefixed} ?connectionPointT .
                                ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                                `;
                            } else {
                                return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                                ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                                ?element_${outerIndex}_${index + 1} ${rdfs.labelPrefixed} ?connectionPointL .
                                ?element_${outerIndex}_${index + 1} ${rdf.typePrefixed} ?connectionPointT .
                                `;
                            }
                        }
                        if (index === 0) {
                            return `
                                <${subject}> a <${pathElement.sourceClassIri}> .
                                <${subject}> ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                                `;
                        }
                        if (index === ((wholePath.length - pathToRootTarget.length) - 1)) {
                            if (index === wholePath.length - 1) {
                                // last element of path
                                return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                                ?result a <${pathElement.targetClassIri}> .
                                ?result ${rdf.typePrefixed} ?resultT .
                                ?result ${rdfs.labelPrefixed} ?resultL .
                                `;
                            }
                            return `
                            ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                            ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                            ?element_${outerIndex}_${index + 1} ${rdfs.labelPrefixed} ?connectionPointODestL .
                            ?element_${outerIndex}_${index + 1} ${rdf.typePrefixed} ?connectionPointODestT .
                          `;


                        }
                        if (index === wholePath.length - 1) {
                            return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                                ?result a <${pathElement.targetClassIri}> .
                                ?result ${rdf.typePrefixed} ?resultT .
                                ?result ${rdfs.labelPrefixed} ?resultL .
                                `;
                        }
                        return `
                            ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                            ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                          `;

                    }
                    ).join('\n');

                    const query = `
                        ${rdf.sparqlPrefix()}
                        ${rdfs.sparqlPrefix()}
                        ${flux.sparqlPrefix()}
        
                        CONSTRUCT {
                            <${link.iri}> ${flux.resultPrefixed} <${link.iri}/${outerIndex}> .
                            <${link.iri}/${outerIndex}> a  ${flux.CompositionLinkResultPrefixed} .
                            <${link.iri}/${outerIndex}> ${flux.resultPrefixed} ?result .
                            <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                            ?result ${rdf.typePrefixed} ?resultT .
                            ?result ${rdfs.labelPrefixed} ?resultL .
                            ?element_${outerIndex}_${pathFromRootSource.length} ${rdfs.labelPrefixed} ?connectionPointL .
                            ?element_${outerIndex}_${pathFromRootSource.length} ${rdf.typePrefixed} ?connectionPointT .
                            ?element_${outerIndex}_${pathFromRootSource.length} a ${flux.ConnectionPointPrefixed} .
                            ?result ${flux.sourcePrefixed} ?element_${outerIndex}_${pathFromRootSource.length} . 
                            ?element_${outerIndex}_${pathFromRootSource.length} ${flux.targetPrefixed} ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} . 
                            ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} ${rdfs.labelPrefixed} ?connectionPointODestL .
                            ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} ${rdf.typePrefixed} ?connectionPointODestT .
                            ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} a ${flux.ConnectionPointPrefixed} .
                        } WHERE {
                            ${body}
                        }`;

                    return [query];
                });

                return q;
            } else {
                const q = link.path.flatMap((path, outerIndex) => {
                    // this is not from the source of the composition
                    const firstPathElement = path[0];
                    const sourceConnectors = sourceComposition.connectionPoints.filter(connectorNode => connectorNode.targetClassIri === firstPathElement.sourceClassIri);
                    if (sourceConnectors.length === 0) {
                        console.warn('No connection points');
                        return [];
                    }
                    const lastPathElement = path[path.length - 1];
                    const targetConnectors = targetComposition.connectionPoints.filter(connectorNode => connectorNode.targetClassIri === lastPathElement.targetClassIri);
                    if (targetConnectors.length === 0) {
                        console.warn('No connection points');
                        return [];
                    }

                    if (sourceConnectors.length > 1) {
                        console.warn('More than one source connector');
                        return [];
                    }

                    if (targetConnectors.length > 1) {
                        console.warn('More than one target connector');
                        return [];
                    }

                    const pathToRootTarget = targetConnectors[0].pathToRoot;

                    const wholePath = [...path, ...pathToRootTarget];
                    const body = wholePath.map((pathElement, index) => {
                        if (index === 0) {
                            // first element of path
                            return `
                                <${subject}> ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                                ?element_${outerIndex}_${index + 1} ${rdfs.labelPrefixed} ?connectionPointL .
                                ?element_${outerIndex}_${index + 1} ${rdf.typePrefixed} ?connectionPointT .
                                ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                                `;
                        }
                        if (index === wholePath.length - 1) {
                            // last element of path
                            return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                                ?result a <${pathElement.targetClassIri}> .
                                ?result  ${rdf.typePrefixed} ?resultT .
                                ?result  ${rdfs.labelPrefixed} ?resultL .
                                `;
                        }
                        return `
                            ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                            ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                          `;

                    }
                    ).join('\n');

                    const query = `
                        ${rdf.sparqlPrefix()}
                        ${rdfs.sparqlPrefix()}
                        ${flux.sparqlPrefix()}
        
                        CONSTRUCT {
                            <${link.iri}> ${flux.resultPrefixed} <${link.iri}/${outerIndex}> .
                            <${link.iri}/${outerIndex}> a  ${flux.CompositionLinkResultPrefixed} .
                            <${link.iri}/${outerIndex}> ${flux.resultPrefixed} ?result .
                            <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                            ?result ${rdf.typePrefixed} ?resultT .
                            ?result ${rdfs.labelPrefixed} ?resultL .
                            ?element_${outerIndex}_1 ${rdf.typePrefixed} ?connectionPointT .
                            ?element_${outerIndex}_1 ${rdfs.labelPrefixed} ?connectionPointL .
                            ?element_${outerIndex}_1 a ${flux.ConnectionPointPrefixed} .
                            ?result ${flux.targetPrefixed} ?element_${outerIndex}_1 . 

                        } WHERE {
                            ${body}
                        }`;
                    return [query];


                });
                return q;


            }
        });

        return queries;

    }

    /**
     * This method creates the SPARQL queries to get "neighbor" of the given subject based on the given classes and
     * the links between them.
     * 
     * @param viewGraphMetadata The dataset containing the links
     * @param classIris all Class IRIs of the current subject
     * @param subject the subject IRI
     * @returns An array of SPARQL queries to get the links between an aggregate and a node for the given classes
     */
    getCompositionToNodeLinkQueries(viewGraphMetadata: RdfTypes.Dataset, classIris: string[], subject: string): string[] {
        const links = this.#extractCompositionToNodeLinks(viewGraphMetadata, classIris);

        // strategies to create the queries
        const strategies: CompositionToNodeQueryStrategy[] = [
            new CompositionToNodeRootStrategy(),
            new CompositionToNodeConnectionPointStrategy(),
            new TargetNodeStrategy()
        ];

        const queries = strategies.flatMap(strategy => {
            const flitteredLinksForTheCurrentStrategy = strategy.filter(links, classIris);
            return flitteredLinksForTheCurrentStrategy.flatMap(link => strategy.createQuery(link, subject));
        });

        return [...queries];
    }


}


