import { blueprint, rdf, rdfs } from "@blueprint/ontology";
import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";
import { CompositionToNodeQueryStrategy } from "./composition-to-node-query-strategy";

/**
 * ConnectionPointOfSourceStrategy
 * The subject class is a connection point of the source composition. That means we are in the middle of the Hierarchy and we link to
 * the target node.
 */
export class CompositionToNodeConnectionPointStrategy implements CompositionToNodeQueryStrategy {
    filter(links: ICompositionToNodeLink[], classIris: string[]): ICompositionToNodeLink[] {
        return links.filter(link => {
            const sourceComposition = link.sourceComposition;
            if (sourceComposition === null) {
                return false;
            }
            const root = sourceComposition.aggregateNodes.find(memberNode => memberNode.iri === sourceComposition.rootIri);
            const memberClasses = sourceComposition.connectionPoints.filter(memberNode => classIris.includes(memberNode.targetClassIri) && memberNode.targetClassIri !== root.targetClassIri);
            return memberClasses.length > 0;
        });
    }

    createQuery(link: ICompositionToNodeLink, subject: string): string[] {
        console.log('%cConnectionPointOfSourceStrategy query', 'color: green');

        return this.#createQueryForSourceConnectionPoint(link, subject);
    }


    #createQueryForSourceConnectionPoint(link: ICompositionToNodeLink, subject: string): string[] {
        const pathFromLink = link.path;
        const queries = pathFromLink.flatMap((path, outerIndex) => {
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
