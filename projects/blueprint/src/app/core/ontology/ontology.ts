import { NamespaceBuilder } from '@rdfjs/namespace';

export abstract class Ontology {
    protected readonly _namespace: NamespaceBuilder<string>;

    constructor(namespace: NamespaceBuilder<string>) {
        this._namespace = namespace;
    }

}
