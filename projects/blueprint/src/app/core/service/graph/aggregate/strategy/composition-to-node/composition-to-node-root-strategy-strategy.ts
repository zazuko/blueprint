import { blueprint, rdf, rdfs } from "@blueprint/ontology";
import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";
import { CompositionToNodeQueryStrategy } from "./composition-to-node-query-strategy";

/**
 * CompositionToNodeRootStrategy
 * The subject class is the root of the source composition. That means we are on top of the Hierarchy and we link to
 * the target node.
 */
export class CompositionToNodeRootStrategy extends CompositionToNodeQueryStrategy {
    filter(links: ICompositionToNodeLink[], classIris: string[]): ICompositionToNodeLink[] {
        return links.filter(link => {
            const sourceComposition = link.sourceComposition;
            if (sourceComposition === null) {
                return false;
            }
            const root = sourceComposition.aggregateNodes.find(memberNode => memberNode.iri === sourceComposition.rootIri);
            return classIris.includes(root?.targetClassIri);
        });
    }

    createQuery(link: ICompositionToNodeLink, subject: string): string[] {
        console.log('%cCompositionToNodeRootStrategy query', 'color: red');
        return this.#createQueryForRootOfSourceAggregate(link, subject);
    }

    #createQueryForRootOfSourceAggregate(link: ICompositionToNodeLink, subject: string): string[] {
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
}