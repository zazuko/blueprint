
import { GraphPointer } from 'clownface';

import { flux, appLocal } from "@blueprint/ontology";
import { HierarchyElement } from '../../view-component-library/hierarchy/hierarchy.component';
import { rdfEnvironment, RdfTypes } from '../../../rdf/rdf-environment';
import { ColorUtil } from '../../../utils/color-util';

export interface UiHierarchyView {
    iri: string;
    label: string;
    elements: HierarchyElement[];
}


export class RdfUiHierarchyView implements UiHierarchyView {

    private readonly _node: GraphPointer;

    private _iri: string | null = null;
    private _label: string | null = null;
    private _elements: HierarchyElement[] | null = null;

    constructor(node: RdfTypes.NamedNode, dataset: RdfTypes.Dataset) {
        this._node = rdfEnvironment.clownface(dataset).node(node);
    }

    /**
     * Get the iri of the view.
     * 
     * @readonly
     */
    get iri(): string {
        if (this._iri === null) {
            this._iri = this._node.value;
        }
        return this._node.value;
    }

    /**
     * Get the label of the view.
     * 
     * @readonly
     */
    get label(): string {
        if (this._label === null) {
            const labelArray = this._node.out(flux.namespace['label']).values;
            if (labelArray.length === 0) {
                console.error(`No label found for view <${this.iri}>`);
                this._label = '';
            } else if (labelArray.length > 1) {
                console.error(`Multiple labels found for view <${this.iri}>`);
                console.error('Joining labels with comma');
                this._label = labelArray.join(', ');
            } else {
                this._label = labelArray[0];
            }
        }
        return this._label;
    }

    /**
     * Get the elements of the view.
     * 
     * @readonly
     */
    get elements(): HierarchyElement[] {
        if (this._elements === null) {

            this._elements = this._node.out(appLocal.resultNamedNode).out(appLocal.elementNamedNode).map(node => {
                const iri = node.out(appLocal.iriNamedNode).value ?? '';
                const classLabel = node.out(appLocal.classLabelNamedNode).value ?? '';
                const label = node.out(appLocal.labelNamedNode).value ?? '';
                const icon = node.out(appLocal.iconNamedNode).value ?? '';
                const color = ColorUtil.getColorForIndexString(node.out(appLocal.colorIndexNamedNode).value ?? '-1');
                const index = Number(node.out(appLocal.indexNamedNode).value ?? '99');
                return {
                    iri,
                    classIri: '',
                    label,
                    classLabel,
                    icon,
                    color,
                    index
                };
            }
            ).sort((a, b) => b.index - a.index);
        }

        return this._elements;
    }
}
