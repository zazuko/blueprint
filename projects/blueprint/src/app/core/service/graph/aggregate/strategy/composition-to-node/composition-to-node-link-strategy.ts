import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";

export abstract class CompositionToNodeLinkStrategy {
    abstract filter(links: ICompositionToNodeLink[], classIris: string[]): ICompositionToNodeLink[];
    abstract createQuery(link: ICompositionToNodeLink, subject: string): string[];
}

