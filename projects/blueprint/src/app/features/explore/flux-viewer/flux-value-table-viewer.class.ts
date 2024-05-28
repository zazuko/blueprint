import { GraphPointer } from 'clownface';


import { FluxDetailMetadata } from "./flux-detail-metadata.class";
import { FluxViewer } from "./flux-detail-viewer.class";

import { FluxViewerType } from './flux-viewer.model';

import { shacl } from '@blueprint/ontology';
import { getPathPredicates } from './metadata-utilities';
import { PathPredicate } from './model/path-predicate.model';

export class FluxValueTableViewer extends FluxViewer {
    private columns: ColumnDefinition[] = null;

    constructor(metadata: FluxDetailMetadata) {
        super(metadata);

        this.columns = this.metadata.node
            .out(shacl.nodeNamedNode)
            .out(shacl.propertyNamedNode)
            .map((column) => {
                return {
                    node: column,
                    label: column.out(shacl.nameNamedNode).value ?? '',
                    order: Number(column.out(shacl.orderNamedNode).value ?? 99),
                    path: getPathPredicates(column)[0] ?? [],
                };
            })
            .sort((a, b) => a.order - b.order);
    }

    get viewerType(): FluxViewerType {
        return FluxViewerType.ValueTableViewer;
    }

    get header(): string[] {
        return this.columns.map((column) => column.label);
    }

    getRowPath(): PathPredicate[] {
        const predicatePath = getPathPredicates(this.metadata.node);
        if (predicatePath.length === 0) {
            console.log(
                `FluxValueTableViewer#model integrity: Detail metadata ${this.iri} has no Path defined.`
            );
        } else if (predicatePath.length > 1) {
            console.log(
                `FluxValueTableViewer#model integrity: Detail metadata ${this.iri} has multiple Paths defined. Only one is supported`
            );
        }
        return predicatePath[0] ?? [];
    }

    getColumnPaths(): PathPredicate[][] {
        return this.columns.map((column) => column.path);
    }
}

interface ColumnDefinition {
    node: GraphPointer;
    label: string;
    path: PathPredicate[];
    order: number;
}
