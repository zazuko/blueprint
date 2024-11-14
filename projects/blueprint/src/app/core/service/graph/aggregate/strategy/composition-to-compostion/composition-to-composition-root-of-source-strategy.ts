import { ICompositionToCompositionLink } from "../../model/composition/composition-to-composition-link";
import { CompositionToCompositionQueryStrategy } from "./composition-to-composition-query-strategy";




export class CompositionToCompositionRootOfSourceStrategy extends CompositionToCompositionQueryStrategy {
    filter(links: ICompositionToCompositionLink[], classIris: string[]): ICompositionToCompositionLink[] {
        return links.filter(link => {
            const sourceComposition = link.sourceComposition;
            if (sourceComposition === null) {
                return false;
            }
            const root = sourceComposition.aggregateNodes.find(memberNode => memberNode.iri === sourceComposition.rootIri);
            return classIris.includes(root?.targetClassIri);
        });
    }

    createQuery(link: ICompositionToCompositionLink, subject: string): string[] {
        console.log('%cCompositionToCompositionRootOfSourceStrategy query', 'color: cyan', link.label);
        return this.#createQueryForRootOfSourceAggregate(link, subject);
    }

    #createQueryForRootOfSourceAggregate(link: ICompositionToCompositionLink, subject: string): string[] {
        return ['query'];
    }
}