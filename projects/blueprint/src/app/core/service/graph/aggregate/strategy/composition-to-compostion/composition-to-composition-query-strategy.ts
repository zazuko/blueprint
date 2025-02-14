import { ICompositionToCompositionLink } from "../../model/composition/composition-to-composition-link";

export abstract class CompositionToCompositionQueryStrategy {
    abstract filter(links: ICompositionToCompositionLink[], classIris: string[]): ICompositionToCompositionLink[];
    abstract createQuery(link: ICompositionToCompositionLink, subjectIri: string): string[];
}

