import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";

export abstract class CompositionToNodeQueryStrategy {
    abstract filter(links: ICompositionToNodeLink[], classIris: string[]): ICompositionToNodeLink[];
    abstract createQuery(link: ICompositionToNodeLink, subject: string): string[];
}

