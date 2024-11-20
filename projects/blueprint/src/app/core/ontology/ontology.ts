import { NamespaceBuilder } from '@rdfjs/namespace';

export abstract class Ontology<Terms extends string = string> {
    protected readonly _namespace: NamespaceBuilder<Terms>;

    constructor(namespace: NamespaceBuilder<Terms>) {
        this._namespace = namespace;
    }

}
