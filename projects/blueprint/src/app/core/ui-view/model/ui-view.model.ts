import { GraphPointer } from 'clownface';

import { rdfs, nileaUi } from '@blueprint/ontology';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';

/**
 * This class represents a RdfUiView.
 * A UiView is a collection of UiViewContainers.
 */
export interface UiView {
    iri: string;
    viewContainer: UiViewContainer[];
}

export class RdfUiView extends ClownfaceObject implements UiView {

    private _viewContainer: UiViewContainer[] | null = null;

    /**
     * The constructor of the UiView.
     * 
     * @param iri The iri of the UiView.
     * @param dataset The dataset that contains the UiView.
     */
    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * get all UiViewContainers of the UiView.
     * 
     * @returns All UiViewContainers of the UiView.
     */
    get viewContainer(): UiViewContainer[] {
        if (this._viewContainer === null) {
            this._viewContainer = this._node.out(nileaUi.hasViewContainerNamedNode).map(viewContainer => {
                return new RdfUiViewContainer(viewContainer);
            });
        }
        return this._viewContainer;
    }
}

/**
 * UiViewContainer is a container for UiViewComponents.
 * 
 */
export interface UiViewContainer {
    /**
     * The iri of the UiViewContainer.
     */
    iri: string;
    /**
     * The order of the UiViewContainer.
     */
    order: number;
    /**
     * The UiViewComponents of the UiViewContainer.
     */
    viewComponent: UiViewComponent[];
}

/**
 * This class implements the UiViewContainer interface. It is a wrapper for an RDF dataset to bridge between
 * a Typescript Object and an RDF Graph.
 */
export class RdfUiViewContainer extends ClownfaceObject implements UiViewContainer {
    private _viewComponents: UiViewComponent[] | null = null;
    private _order: number | null = null;

    /**
     * The node is a Clownface graph pointer that points to the UiViewContainer in the RDF graph.
     * 
     * @param node The node that represents the UiViewContainer in the RDF graph.
     */
    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The order of the UiViewContainer.
     * 
     * @returns The order of the UiViewContainer.
     */
    get order() {
        if (this._order === null) {
            this._order = Number(this._node.out(nileaUi.orderNamedNode).value ?? '99');
        }
        return this._order;
    }

    /**
     * The UiViewComponents of the UiViewContainer.
     * 
     * @returns The UiViewComponents of the UiViewContainer.
     */
    get viewComponent(): UiViewComponent[] {
        if (this._viewComponents === null) {
            this._viewComponents = this._node.out(nileaUi.hasViewComponentNamedNode).map(component => {
                return new RdfUiViewComponent(component);
            }
            );
        }
        return this._viewComponents;
    }
}

/**
 * This interface represents a UiViewComponent.
 * 
 * A UiViewComponent is a component that is used to display data in a UiView.
 * 
 * iri: The iri of the UiViewComponent.
 * componentDefinition: The UiViewComponentDefinition of the UiViewComponent.
 * componentData: The data of the UiViewComponent.
 * 
 */
export interface UiViewComponent {
    /**
     * The iri of the UiViewComponent.
     */
    iri: string;

    /**
     * The UiViewComponentDefinition of the UiViewComponent.
     */
    componentDefinition: UiViewComponentDefinition;

    /**
     * The data of the UiViewComponent.
     */
    componentData?: GraphPointer;
}

/**
 * This class implements the UiViewComponent interface. It is a wrapper for an RDF dataset to bridge between
 * a Typescript Object and an RDF Graph.
 * 
 * 
 */
export class RdfUiViewComponent extends ClownfaceObject implements UiViewComponent {
    private _iri: string | null = null;
    private _componentDefinition: UiViewComponentDefinition | null = null;
    private _componentData: GraphPointer | null = null;
    /**
     * The node is a Clownface graph pointer that points to the UiViewComponent in the RDF graph.
     * 
     * @param node The node that represents the UiViewComponent in the RDF graph.
     */
    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The componentDefinition is a UiViewComponentDefinition that is used to display the data of the UiViewComponent.
     * 
     * @returns The UiViewComponentDefinition of the UiViewComponent.
     */
    get componentDefinition(): UiViewComponentDefinition {
        if (this._componentDefinition === null) {
            const componentDefinitionPointer = this._node.out(nileaUi.hasComponentDefinitionNamedNode);
            if (componentDefinitionPointer.values.length !== 1) {
                if (componentDefinitionPointer.values.length > 1) {
                    throw new Error(`The UiComponent <${this.iri}> has more than one component definition.`);
                }
                throw new Error(`The UiComponent <${this.iri}> has no component definition.`);
            }
            this._componentDefinition = new RdfUiViewComponentDefinition(componentDefinitionPointer as GraphPointer);
        }

        return this._componentDefinition
    }

    /**
     * The componentData is the data of the UiViewComponent. It is the result of the sparql query and 
     * the input for the UiViewComponentDefinition.
     * 
     * @returns The data of the UiViewComponent.
     */
    get componentData(): GraphPointer {
        if (this._componentData === null) {
            this._componentData = this._node.out(nileaUi.hasComponentDataNamedNode) as GraphPointer;
        }
        return this._componentData;
    }

}

/**
 * This is the interface for a UiViewComponentDefinition.
 * 
 * A UiViewComponentDefinition is a definition of a UiViewComponent. It contains the sparql query that is used to
 * retrieve the data for the UiViewComponent.
 */
export interface UiViewComponentDefinition {
    iri: string;
    label: string;
    comment: string;
    sparqlQuery: string;
}

/**
 * This class implements the UiViewComponentDefinition interface. It is a wrapper for an RDF dataset to bridge between
 * a Typescript Object and an RDF Graph.
 */
export class RdfUiViewComponentDefinition extends ClownfaceObject implements UiViewComponentDefinition {

    private _label: string | null = null;
    private _comment: string | null = null;
    private _sparqlQuery: string | null = null;

    /**
     * The node is a Clownface graph pointer that points to the UiViewComponentDefinition in the RDF graph.
     * @param node The node that represents the UiViewComponentDefinition in the RDF graph.
     */
    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The label of the UiViewComponentDefinition.
     * @returns The label of the UiViewComponentDefinition.
     */
    get label(): string {
        if (this._label === null) {
            this._label = this._node.out(rdfs.labelNamedNode).value ?? '';
        }
        return this._label
    }

    /**
     * The comment of the UiViewComponentDefinition.
     * @returns The comment of the UiViewComponentDefinition.
     */
    get comment(): string {
        if (this._comment === null) {
            this._comment = this._node.out(rdfs.commentNamedNode).value ?? '';
        }
        return this._comment
    }

    /**
     * The SPARQL query template to get the component input data.
     * @returns The SPARQL query template to get the component input data.
     */
    get sparqlQuery(): string {
        if (this._sparqlQuery === null) {
            this._sparqlQuery = this._node.out(nileaUi.queryNamedNode).value ?? '';
        }
        return this._sparqlQuery;
    }

}




