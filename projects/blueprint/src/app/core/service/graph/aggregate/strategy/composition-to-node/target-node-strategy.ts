import { blueprint, rdf, rdfs } from "@blueprint/ontology";
import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";
import { CompositionToNodeQueryStrategy } from "./composition-to-node-query-strategy";

/**
 */
export class TargetNodeStrategy implements CompositionToNodeQueryStrategy {
    filter(links: ICompositionToNodeLink[], classIris: string[]): ICompositionToNodeLink[] {
        return links.filter(link => {
            if (!link.sourceNodeIri) {
                return false;
            }
            return classIris.includes(link.sourceNodeIri);
        });
    }

    createQuery(link: ICompositionToNodeLink, subject: string): string[] {
        console.log('%cTargetNodeStrategy query', 'color: yellow');

        return this.#createQueryForSourceNode(link, subject);
    }

    #createQueryForSourceNode(link: ICompositionToNodeLink, subject: string): string[] {
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
}