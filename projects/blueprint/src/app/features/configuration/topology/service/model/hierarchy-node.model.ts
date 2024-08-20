import { GraphPointer } from 'clownface';

import { rdfs, shacl } from '@blueprint/ontology';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';

export class HierarchyNode extends ClownfaceObject {

    // lazy evaluation
    #_children: HierarchyNode[] | null = null;
    #_targetClass: string | null = null;
    #_label: string | null = null;
    #_classLabel: string | null = null;
    #_parent: HierarchyNode | null | undefined = undefined;

    constructor(cfNode: GraphPointer) {
        super(cfNode);
    }

    get label(): string {
        if (this.#_label === null) {
            this.#_label = this._node.out(rdfs.labelNamedNode).value ?? '';
        }
        return this.#_label;
    }

    get children(): HierarchyNode[] {
        if (this.#_children === null) {
            this.#_children = this._node.out(shacl.propertyNamedNode).out(shacl.nodeNamedNode).map(childNode => new HierarchyNode(childNode));
        }
        return this.#_children;
    }

    get targetClass(): string {
        if (this.#_targetClass === null) {
            const targetClasses = this._node.out(shacl.targetClassNamedNode).values;
            if (targetClasses.length === 0) {
                console.warn(`No targetClass found for node ${this.iri}. Use an empty string.`);
                this.#_targetClass = '';
            } else {
                if (targetClasses.length > 1) {
                    console.warn(`Expected exactly one targetClass for node ${this.iri}. Found ${targetClasses.length}. Use the first one.`);
                }
                this.#_targetClass = targetClasses[0];
            }
        }
        return this.#_targetClass;
    }

    get classLabel(): string {
        if (this.#_classLabel === null) {
            const classLabels = this._node.out(shacl.targetClassNamedNode).in(shacl.targetNodeNamedNode).out(rdfs.labelNamedNode).values;
            if (classLabels.length === 0) {
                console.warn(`No classLabel found for node ${this.iri}. Use an empty string.`);
                this.#_classLabel = '';
            } else {
                if (classLabels.length > 1) {
                    console.warn(`Expected exactly one classLabel for node ${this.iri}. Found ${classLabels.length}. Use the first one.`);
                }
                this.#_classLabel = classLabels[0];
            }
        }
        return this.#_classLabel;
    }

    get pathToParent(): string | null {

        const pathFromParentToThisNode = this._node.in(shacl.nodeNamedNode).out(shacl.pathNamedNode);

        if (pathFromParentToThisNode.values.length === 0) {
            return null;
        }
        if (pathFromParentToThisNode.values.length > 1) {
            console.error(`Expected exactly one path for node ${this.iri}. Found ${pathFromParentToThisNode.values.length}.`);
            return null;
        }
        if (pathFromParentToThisNode.isList()) {
            console.error(`List are currently not supported for node ${this.iri}.`);
            return null;
        }
        // the path is valid
        // we have to invert  it because we need the path to the parent node
        if (pathFromParentToThisNode.term.termType === 'BlankNode') {
            const inverse = pathFromParentToThisNode.out(shacl.inversePathNamedNode);
            const zeroOrMorePath = pathFromParentToThisNode.out(shacl.zeroOrMorePathNamedNode);
            if (inverse.values.length === 1) {
                return `<${inverse.value}>`;
            }
            if (zeroOrMorePath.values.length === 1) {
                return `^<${zeroOrMorePath.value}>*`;
            }
            console.log(zeroOrMorePath.value);
            console.error(`Expected exactly one inversePath for node ${this.iri} or one zeroToMorePath Found ${inverse.values.length}.`);
            return '';
        }
        if (pathFromParentToThisNode.values.length === 1) {
            return `^<${pathFromParentToThisNode.value}>`;
        }
        console.error(`Expected exactly one path for node ${this.iri}. Found ${pathFromParentToThisNode.values.length}.`);
        return '';
    }

    get pathFromRoot(): string {
        const path = this._node.in(shacl.nodeNamedNode).out(shacl.pathNamedNode);
        if (path.isList()) {
            return '';
        }

        if (path.term.termType === 'BlankNode') {
            const inverse = path.out(shacl.inversePathNamedNode);
            if (inverse.values.length === 1) {
                return `^<${inverse.value}>`;
            }

            console.error(`Expected exactly one inversePath for node ${this.iri}. Found ${inverse.values.length}.`);
            return '';
        }
        if (path.values.length === 1) {
            return `<${path.value}>`;
        }
        console.error(`Expected exactly one path for node ${this.iri}. Found ${path.values.length}.`);
        return '';
    }


    get parent(): HierarchyNode | null {
        if (this.#_parent === undefined) {
            const parent = this._node.in(shacl.nodeNamedNode).in(shacl.propertyNamedNode);
            if (parent.values.length === 0) {
                this.#_parent = null;
            } else {
                if (parent.values.length > 1) {
                    console.warn(`Expected exactly one parent for node ${this.iri}. Found ${parent.values.length}. Use the first one.`);
                }
                this.#_parent = new HierarchyNode(parent.toArray()[0]);
            }
        }
        return this.#_parent;
    }

}
