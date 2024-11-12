import { Injectable } from '@angular/core';
import { blueprint, rdf, rdfs, shacl } from '@blueprint/ontology';
import { Dataset } from '@rdfjs/types';
import rdfEnvironment from '@zazuko/env';
import { ICompositionToNodeLink } from './model/composition/composition-to-node-link';
import { ICompositionToCompositionLink } from './model/composition/composition-to-composition-link';
import { OutgoingCompositionToNodeLinkFactory } from './factory/composition-to-node-link-factory/outgoing-composition-to-node-link-factory';
import { IncomingCompositionToNodeLinkFactory } from './factory/composition-to-node-link-factory/incoming-composition-to-node-link-factory';
import { compositionToNodeLinksForClassQuery } from './query/composition-to-node-links-for-class.query';
import { compositionToCompositionLinksForClassQuery } from './query/composition-to-composition-links-for-class.query';
import { OutgoingCompositionToCompositionLinkFactory } from './factory/composition-to-composition-link-factory/outgoing-composition-to-composition-link-factory';
import { IncomingCompositionToCompositionLinkFactory } from './factory/composition-to-composition-link-factory/incoming-composition-to-composition-link-factory';
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
    private _extractCompositionToCompositionLinks(linkDataset: Dataset, classIris: string[]): ICompositionToCompositionLink[] {
        const linkGraph = rdfEnvironment.clownface({ dataset: linkDataset });

        const outLinks: ICompositionToCompositionLink[] = [];
        const outLinkFactory = new OutgoingCompositionToCompositionLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(shacl.targetClassNamedNode)
                .out(shacl.groupNamedNode)
                .in(shacl.targetClassNamedNode)
                .map(link => outLinkFactory.creteLink(link));
            outLinks.push(...links);
        });

        const inLinks: ICompositionToCompositionLink[] = [];
        const inLinkFactory = new IncomingCompositionToCompositionLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(shacl.targetClassNamedNode)
                .out(shacl.groupNamedNode)
                .in(blueprint.targetNamedNode)
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
    private _extractCompositionToNodeLinks(linkDataset: Dataset, classIris: string[]): ICompositionToNodeLink[] {
        const linkGraph = rdfEnvironment.clownface({ dataset: linkDataset });

        const outLinks: ICompositionToNodeLink[] = [];
        const outLinkFactory = new OutgoingCompositionToNodeLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(shacl.targetClassNamedNode)
                .out(shacl.groupNamedNode)
                .in(shacl.targetClassNamedNode)
                .has(rdf.typeNamedNode, blueprint.CompositionToNodeLinkNamedNode)
                .map(link => outLinkFactory.creteLink(link));
            outLinks.push(...links);
        });

        const inLinks: ICompositionToNodeLink[] = [];
        const inLinkFactory = new IncomingCompositionToNodeLinkFactory();

        classIris.forEach(iri => {
            const links = linkGraph.namedNode(iri)
                .in(blueprint.targetNamedNode)
                .has(rdf.typeNamedNode, blueprint.CompositionToNodeLinkNamedNode)
                .map(link => inLinkFactory.creteLink(link));
            inLinks.push(...links);
        });

        return [...outLinks, ...inLinks];
    }

    getCompositionToCompositionLinkQueries(viewGraphMetadata: Dataset, classIris: string[], subject: string): string[] {
        const links = this._extractCompositionToCompositionLinks(viewGraphMetadata, classIris);

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
                                VALUES ?connectionPointP {
                                    ${rdfs.labelPrefixed}
                                    ${rdf.typePrefixed}
                                }
                                ?element_${outerIndex}_${index + 1} ?connectionPointP ?connectionPointO .
                                ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                                `;
                            } else {
                                return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                                ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                                VALUES ?connectionPointP {
                                    ${rdfs.labelPrefixed}
                                    ${rdf.typePrefixed}
                                }
                                ?element_${outerIndex}_${index + 1} ?connectionPointP ?connectionPointO .
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
                                VALUES ?resultP {
                                    ${rdf.typePrefixed}
                                    ${rdfs.labelPrefixed}
                                }
                                ?result ?resultP ?resultO .
                                `;
                            }
                            return `
                            ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                            ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                            ?element_${outerIndex}_${index + 1} ?connectionPointP ?connectionPointODest .
                          `;


                        }
                        if (index === wholePath.length - 1) {
                            return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                                ?result a <${pathElement.targetClassIri}> .
                                VALUES ?resultP {
                                    ${rdf.typePrefixed}
                                    ${rdfs.labelPrefixed}
                                }
                                ?result ?resultP ?resultO .
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
                        ${blueprint.sparqlPrefix()}
        
                        CONSTRUCT {
                            <${link.iri}> ${blueprint.resultPrefixed} <${link.iri}/${outerIndex}> .
                            <${link.iri}/${outerIndex}> a  ${blueprint.CompositionLinkResultPrefixed} .
                            <${link.iri}/${outerIndex}> ${blueprint.resultPrefixed} ?result .
                            <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                            ?result ?resultP ?resultO .
                            ?element_${outerIndex}_${pathFromRootSource.length} ?connectionPointP ?connectionPointO .
                            ?element_${outerIndex}_${pathFromRootSource.length} a ${blueprint.ConnectionPointPrefixed} .
                            ?result ${blueprint.sourcePrefixed} ?element_${outerIndex}_${pathFromRootSource.length} . 
                            ?element_${outerIndex}_${pathFromRootSource.length} ${blueprint.targetPrefixed} ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} . 
                            ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} ?connectionPointP ?connectionPointODest .
                            ?element_${outerIndex}_${wholePath.length - pathToRootTarget.length} a ${blueprint.ConnectionPointPrefixed} .
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
                                <${subject}> a <${pathElement.sourceClassIri}> .
                                <${subject}> ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                                VALUES ?connectionPointP {
                                    ${rdfs.labelPrefixed}
                                    ${rdf.typePrefixed}
                                }
                                ?element_${outerIndex}_${index + 1} ?connectionPointP ?connectionPointO .
                                ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                                `;
                        }
                        if (index === wholePath.length - 1) {
                            // last element of path
                            return `
                                ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                                ?result a <${pathElement.targetClassIri}> .
                                VALUES ?resultP {
                                    ${rdf.typePrefixed}
                                    ${rdfs.labelPrefixed}
                                }
                                ?result ?resultP ?resultO .
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
                        ${blueprint.sparqlPrefix()}
        
                        CONSTRUCT {
                            <${link.iri}> ${blueprint.resultPrefixed} <${link.iri}/${outerIndex}> .
                            <${link.iri}/${outerIndex}> a  ${blueprint.CompositionLinkResultPrefixed} .
                            <${link.iri}/${outerIndex}> ${blueprint.resultPrefixed} ?result .
                            <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                            ?result ?resultP ?resultO .
                            ?element_${outerIndex}_1 ?connectionPointP ?connectionPointO .
                            ?element_${outerIndex}_1 a ${blueprint.ConnectionPointPrefixed} .
                            ?result ${blueprint.targetPrefixed} ?element_${outerIndex}_1 . 

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

    getCompositionToNodeLinkQueries(viewGraphMetadata: Dataset, classIris: string[], subject: string): string[] {
        const links = this._extractCompositionToNodeLinks(viewGraphMetadata, classIris);

        // there are 4 possible cases
        // 1. the subject class is the root of the source composition
        const linksWhereThisIsRootOfSourceAggregate = links.filter(link => {
            const sourceComposition = link.sourceComposition;
            if (sourceComposition === null) {
                return false;
            }
            const root = sourceComposition.aggregateNodes.find(memberNode => memberNode.iri === sourceComposition.rootIri)
            return classIris.includes(root?.targetClassIri)
        });

        // 2. the subject class is a member of the source composition and it's a connection point but not root
        const linksWhereThisIsConnectionPointOfTheSource = links.filter(link => {
            const sourceComposition = link.sourceComposition;
            if (sourceComposition === null) {
                return false;
            }
            const root = sourceComposition.aggregateNodes.find(memberNode => memberNode.iri === sourceComposition.rootIri)
            const memberClasses = sourceComposition.connectionPoints.filter(memberNode => classIris.includes(memberNode.targetClassIri) && memberNode.targetClassIri !== root.targetClassIri);
            return memberClasses.length > 0;
        });

        // 3. the subject's class is the source node
        // then target is an aggregate
        const linksWhereThisIsTheSourceNode = links.filter(link => {
            if (!link.sourceNodeIri) {
                return false;
            }
            return classIris.includes(link.sourceNodeIri);
        });

        // 4. the subject's class is the target node 
        // then source is an aggregate
        const linksWhereThisIsTheTargetNode = links.filter(link => {
            if (!link.targetNodeIri) {
                return false;
            }
            return classIris.includes(link.targetNodeIri);
        });
        if (linksWhereThisIsTheTargetNode.length > 0) {
            console.warn('Not implemented yet');
        }

        // crete queries for each case
        // 1. the subject class is the root of the source aggregate
        const queriesForRootOfSourceAggregate = linksWhereThisIsRootOfSourceAggregate.flatMap(link => this._createQueryForRootOfSourceAggregate(link, subject));

        // 2. the subject class is a member of the source composition and it's a connection point but not root
        const linksWhereThisIsTheSourceNodeQueries = linksWhereThisIsTheSourceNode.flatMap(link => this._createQueryForSourceNode(link, subject));

        // 3. the subject class is the connection point of the source composition
        const linksWhereThisIsConnectionPointOfTheSourceQueries = linksWhereThisIsConnectionPointOfTheSource.flatMap(link => this._createQueryForSourceConnectionPoint(link, subject, classIris));

        return [...queriesForRootOfSourceAggregate, ...linksWhereThisIsTheSourceNodeQueries, ...linksWhereThisIsConnectionPointOfTheSourceQueries];
    }

    private _createQueryForRootOfSourceAggregate(link: ICompositionToNodeLink, subject: string): string[] {
        const linkTargetNodeClass = link.targetNodeIri;
        const linkSourceComposition = link.sourceComposition;
        if (linkSourceComposition === null) {
            console.warn('No source composition');
            return [];
        }
        const q = link.path.flatMap(pathFromLink => {
            const firstPathElement = pathFromLink[0];

            const connectionPoints = linkSourceComposition.connectionPoints.filter(connectorNode => connectorNode.targetClassIri === firstPathElement.sourceClassIri);
            if (connectionPoints.length === 0) {
                console.warn('No connection points');
                return [];
            }

            // the subject is the root node of the source of the link -> all links are from this to the targetNode
            // that means we are always source of the link
            const lastPathElement = pathFromLink[pathFromLink.length - 1];
            if (lastPathElement.targetClassIri !== linkTargetNodeClass) {
                console.warn(`Last path element is not the target class for link <${link.iri}>. This is a configuration error.`);
                return [];
            }

            const sourceConnectors = connectionPoints.filter(connectorNode => connectorNode.targetClassIri === firstPathElement.sourceClassIri);
            if (sourceConnectors.length === 0) {
                console.warn(`No connector class <${firstPathElement.sourceClassIri}> for link <${link.iri}>. This is a configuration error.`);
                return [];
            }

            const queries = sourceConnectors.flatMap((connectionPoint, outerIndex) => {
                const pathFromRoot = connectionPoint.pathFromRoot;
                const linkPath = pathFromLink;
                const path = [...pathFromRoot, ...linkPath];

                const body = path.map((pathElement, index) => {
                    if (index === pathFromRoot.length - 1 && pathFromRoot.length != 0) {
                        if (index === 0) {
                            return `
                            <${subject}> a <${pathElement.sourceClassIri}> .
                            <${subject}> ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                            VALUES ?connectionPointP {
                                ${rdfs.labelPrefixed}
                                ${rdf.typePrefixed}
                            }
                            ?element_${outerIndex}_${index + 1} ?connectionPointP ?connectionPointO .
                            ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                            `;
                        } else {
                            return `
                            ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                            ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                            VALUES ?connectionPointP {
                                ${rdfs.labelPrefixed}
                                ${rdf.typePrefixed}
                            }
                            ?element_${outerIndex}_${index + 1} ?connectionPointP ?connectionPointO .
                            `;
                        }
                    }

                    if (index === 0) {
                        if (pathFromRoot.length === 0) {
                            return `
                             # first path element - form link
                    <${subject}> a <${pathElement.sourceClassIri}> .
                    <${subject}> ${pathElement.path} ?result .
                    ?result a <${pathElement.targetClassIri}> .
                   
                       VALUES ?resultP {
                           ${rdf.typePrefixed}
                           ${rdfs.labelPrefixed}
                       }
                       ?result ?resultP ?resultO .
                       BIND(?result as ?connectionPointO)
                       BIND(?result as ?element_0_0)

                       `;
                        }
                        return `
                        <${subject}> a <${pathElement.sourceClassIri}> .
                        <${subject}> ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                        ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                        `;
                    }
                    if (index === path.length - 1) {
                        return `
                        ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                        ?result a <${pathElement.targetClassIri}> .

                        VALUES ?resultP {
                            ${rdf.typePrefixed}
                            ${rdfs.labelPrefixed}
                        }
                        ?result ?resultP ?resultO .
                        `;
                    }
                    return `
                    ?element_${outerIndex}_${index} ${pathElement.path} ?element_${outerIndex}_${index + 1} .
                    ?element_${outerIndex}_${index + 1} a <${pathElement.targetClassIri}> .
                    `;
                }).join('\n');


                const query = `
                ${rdf.sparqlPrefix()}
                ${rdfs.sparqlPrefix()}
                ${blueprint.sparqlPrefix()}

                CONSTRUCT {
                    <${link.iri}> ${blueprint.resultPrefixed} <${link.iri}/${outerIndex}> .
                    <${link.iri}/${outerIndex}> a  ${blueprint.CompositionLinkResultPrefixed} .
                    <${link.iri}/${outerIndex}> ${blueprint.resultPrefixed} ?result .
                    <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                    ?result ?resultP ?resultO .
                    ?element_${outerIndex}_${pathFromRoot.length} ?connectionPointP ?connectionPointO .
                    ?result ${blueprint.sourcePrefixed} ?element_${outerIndex}_${pathFromRoot.length} . 
                } WHERE {
                    ${body} 
                }`;
                return query;
            });
            return queries;
        });
        return q;
    }

    private _createQueryForSourceNode(link: ICompositionToNodeLink, subject: string): string[] {
        const pathFromLink = link.path;

        const queries = pathFromLink.flatMap((path, outerIndex) => {
            const firstPathElement = path[0];
            const lastPathElement = path[path.length - 1];
            const targetNodeClass = lastPathElement.targetClassIri;
            if (link.sourceNodeIri !== firstPathElement.sourceClassIri) {
                console.warn(`Link <${link.iri}> has a path that starts with <${firstPathElement.sourceClassIri}> but the source node is <${link.sourceNodeIri}>`);
                return [];
            }

            const connectionPoint = link.targetComposition?.connectionPoints.find(connectorNode => connectorNode.targetClassIri === targetNodeClass);
            if (!connectionPoint) {
                console.warn(`Link <${link.iri}> has no connection point for <${targetNodeClass}>`);
                return [];
            }
            const pathToRoot = connectionPoint.pathToRoot;
            const pathToTarget = [...path, ...pathToRoot];


            const body = pathToTarget.map((pathElement, index) => {
                console.log('path to root', pathToRoot.length);
                console.log('body count', (pathToTarget.length - pathToRoot.length) - 1);
                if (index === ((pathToTarget.length - pathToRoot.length) - 1)) {
                    if (index === (pathToTarget.length - 1) && pathToRoot.length != 0) {
                        return `
                        # connector last
                       ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                       ?result a <${pathElement.targetClassIri}> .
                       VALUES ?resultP {
                           ${rdf.typePrefixed}
                           ${rdfs.labelPrefixed}
                       }
                       ?result ?resultP ?resultO .
                       `;
                    }
                    else if (index === 0) {
                        if (pathToRoot.length === 0) {
                            return `
                             # first path element - form link
                    <${subject}> a <${pathElement.sourceClassIri}> .
                    <${subject}> ${pathElement.path} ?result .
                    ?result a <${pathElement.targetClassIri}> .
                   
                       VALUES ?resultP {
                           ${rdf.typePrefixed}
                           ${rdfs.labelPrefixed}
                       }
                       ?result ?resultP ?resultO .
                       BIND(?result as ?connectionPointO)
                       BIND(?result as ?element_1)

                       `;
                        }
                        console.log('pathElement connector is first');
                        console.log('pathElement', index);
                        return `
                        # connector in the first
                        <${subject}> ${pathElement.path} ?element_${index + 1} .
                        ?element_${index + 1} a <${pathElement.targetClassIri}> .
                        VALUES ?connectionPointP {
                            ${rdfs.labelPrefixed}
                            ${rdf.typePrefixed}
                        }
                        ?element_${index + 1} ?connectionPointP ?connectionPointO .
                        `;
                    }
                    console.log('pathElement connector is in the middle');
                    console.log('pathElement', index);
                    return `
                        # connector in the middle
                        ?element_${index} ${pathElement.path} ?element_${index + 1} .
                        ?element_${index + 1} a <${pathElement.targetClassIri}> .
                        VALUES ?connectionPointP {
                            ${rdfs.labelPrefixed}
                            ${rdf.typePrefixed}
                        }
                        ?element_${index + 1} ?connectionPointP ?connectionPointO .
                        `;

                }
                if (index === 0) {
                    return `
                    # first path element - form link
                    <${subject}> a <${pathElement.sourceClassIri}> .
                    <${subject}> ${pathElement.path} ?element_${index + 1} .
                    ?element_${index + 1} a <${pathElement.targetClassIri}> .
                    `;
                }
                if (index === pathToTarget.length - 1) {
                    // last path element - form composition
                    return `
                    # last path element - form composition
                    ?element_${index} ${pathElement.path} ?result .
                    ?result a <${pathElement.targetClassIri}> .

                    VALUES ?resultP {
                        ${rdf.typePrefixed}
                        ${rdfs.labelPrefixed}
                    }
                    ?result ?resultP ?resultO .
                    `;
                }
                return `
                # middle path element - form composition
                ?element_${index} ${pathElement.path} ?element_${index + 1} .
                ?element_${index + 1} a <${pathElement.targetClassIri}> .
                `;
            }).join('\n');

            const query = `
            ${rdf.sparqlPrefix()}
            ${rdfs.sparqlPrefix()}
            ${blueprint.sparqlPrefix()}

            CONSTRUCT {
                <${link.iri}> ${blueprint.resultPrefixed} <${link.iri}/${outerIndex}> .
                <${link.iri}/${outerIndex}> a  ${blueprint.CompositionLinkResultPrefixed} .
                <${link.iri}/${outerIndex}> ${blueprint.resultPrefixed} ?result .
                <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                ?result ?resultP ?resultO .
                ?element_${pathToTarget.length - pathToRoot.length} ?connectionPointP ?connectionPointO .
                ?result ${blueprint.targetPrefixed} ?element_${pathToTarget.length - pathToRoot.length} .
                
            } WHERE {
                {
                    ${body}
                }
            }`;
            console.log('%cquery', 'color: red', query);
            return [query];

        });
        return queries;
    }

    private _createQueryForSourceConnectionPoint(link: ICompositionToNodeLink, subject: string, classList: string[]): string[] {
        const pathFromLink = link.path;
        console.log('%c_createQueryForSourceConnectionPoint', 'color: red', pathFromLink);
        const queries = pathFromLink.flatMap((path, outerIndex) => {
            const firstPathElement = path[0];
            if (!classList.includes(firstPathElement.sourceClassIri)) {
                console.log('not part of it');
                return [];
            }

            const pathToTarget = [...path];

            const body = pathToTarget.map((pathElement, index) => {
                if (index === 0 && index === pathToTarget.length - 1) {
                    // it's the start and the end of the path
                    return `
                    # first and last path element - form link
                    <${subject}> a <${pathElement.sourceClassIri}> .
                    <${subject}> ${pathElement.path} ?result .
                    ?result a <${pathElement.targetClassIri}> .

                    VALUES ?resultP {
                        ${rdf.typePrefixed}
                        ${rdfs.labelPrefixed}
                    }
                    ?result ?resultP ?resultO .
                    <${subject}> ?resultP ?subjectO .

                    `;
                }
                if (index === pathToTarget.length - 1 && index !== 0) {
                    // last element
                    if (index === (pathToTarget.length - 1)) {
                        console.log('connector is last ')
                        return `
                        # connector last
                       ?element_${outerIndex}_${index} ${pathElement.path} ?result .
                       ?result a <${pathElement.targetClassIri}> .
                       VALUES ?resultP {
                           ${rdf.typePrefixed}
                           ${rdfs.labelPrefixed}
                       }
                       ?result ?resultP ?resultO .
                       `;
                    }

                    console.log('pathElement connector is in the middle');
                    console.log('pathElement', index);
                    return `
                        # connector in the middle
                        ?element_${index} ${pathElement.path} ?element_${index + 1} .
                        ?element_${index + 1} a <${pathElement.targetClassIri}> .
                        VALUES ?connectionPointP {
                            ${rdfs.labelPrefixed}
                            ${rdf.typePrefixed}
                        }
                        ?element_${index + 1} ?connectionPointP ?connectionPointO .
                        `;

                }
                if (index === 0) {
                    return `
                    # first path element - form link
                    <${subject}> a <${pathElement.sourceClassIri}> .
                    <${subject}> ${pathElement.path} ?element_${index + 1} .
                    ?element_${index + 1} a <${pathElement.targetClassIri}> .
                    `;
                }
                return `
                # middle path element - form composition
                ?element_${index} ${pathElement.path} ?element_${index + 1} .
                ?element_${index + 1} a <${pathElement.targetClassIri}> .
                `;
            }).join('\n');

            const query = `
            ${rdf.sparqlPrefix()}
            ${rdfs.sparqlPrefix()}
            ${blueprint.sparqlPrefix()}

            CONSTRUCT {
                <${link.iri}> ${blueprint.resultPrefixed} <${link.iri}/${outerIndex}> .
                <${link.iri}/${outerIndex}> a  ${blueprint.CompositionLinkResultPrefixed} .
                <${link.iri}/${outerIndex}> ${blueprint.resultPrefixed} ?result .
                <${link.iri}/${outerIndex}> ${rdfs.labelPrefixed} "${link.label}" .
                ?result ?resultP ?resultO .
                <${subject}> ?resultP ?subjectO .

                ?result ${blueprint.sourcePrefixed}  <${subject}> 
                
            } WHERE {
                {
                    ${body}
                }
            }`;
            return [query];

        });
        return queries;
    }
}



