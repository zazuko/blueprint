import { NamedNode } from '@rdfjs/types';


import { Ontology } from '../ontology';
import { rdfEnvironment, NamespaceBuilder } from '../../rdf/rdf-environment';

class NileaUiOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('https://zazuko.com/nilea/ui/'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'nileaUi';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the hasViewContainer predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasViewContainer(): string {
        return this.namespace('hasViewContainer').value;
    }

    /**
     * Get the prefixed hasViewContainer predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasViewContainerPrefixed(): string {
        return `${this.prefix()}:hasViewContainer`;
    }

    /**
     * Get the hasViewContainer predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasViewContainerNamedNode(): NamedNode {
        return this.namespace('hasViewContainer');
    }

    /**
     * Get the order predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get order(): string {
        return this.namespace('order').value;
    }

    /**
     * Get the prefixed order predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get orderPrefixed(): string {
        return `${this.prefix()}:order`;
    }

    /**
     * Get the order predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get orderNamedNode(): NamedNode {
        return this.namespace('order');
    }

    /**
     * Get the hasComponent predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponent(): string {
        return this.namespace('hasComponent').value;
    }

    /**
     * Get the prefixed hasComponent predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentPrefixed(): string {
        return `${this.prefix()}:hasComponent`;
    }

    /**
     * Get the hasComponent predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentNamedNode(): NamedNode {
        return this.namespace('hasComponent');
    }

    /**
     * Get the hasComponentDefinition predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentDefinition(): string {
        return this.namespace('hasComponentDefinition').value;
    }

    /**
     * Get the prefixed hasComponentDefinition predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentDefinitionPrefixed(): string {
        return `${this.prefix()}:hasComponentDefinition`;
    }

    /**
     * Get the hasComponentDefinition predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentDefinitionNamedNode(): NamedNode {
        return this.namespace('hasComponentDefinition');
    }

    /**
     * Get the hasComponentData predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentData(): string {
        return this.namespace('hasComponentData').value;
    }

    /**
     * Get the prefixed hasComponentData predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentDataPrefixed(): string {
        return `${this.prefix()}:hasComponentData`;
    }

    /**
     * Get the hasComponentData predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get hasComponentDataNamedNode(): NamedNode {
        return this.namespace('hasComponentData');
    }

    /**
     * Get the query predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get query(): string {
        return this.namespace('query').value;
    }

    /**
     * Get the prefixed query predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get queryPrefixed(): string {
        return `${this.prefix()}:query`;
    }

    /**
     * Get the query predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get queryNamedNode(): NamedNode {
        return this.namespace('query');
    }

    /**
     * Get the UiView class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get UiView(): string {
        return this.namespace('UiView').value;
    }

    /**
     * Get the prefixed UiView class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get UiViewPrefixed(): string {
        return `${this.prefix()}:UiView`;
    }

    /**
     * Get the UiView class as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get UiViewNamedNode(): NamedNode {
        return this.namespace('UiView');
    }

    /**
     * Get the forClass predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get forClass(): string {
        return this.namespace('forClass').value;
    }

    /**
     * Get the prefixed forClass predicate.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get forClassPrefixed(): string {
        return `${this.prefix()}:forClass`;
    }

    /**
     * Get the forClass predicate as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get forClassNamedNode(): NamedNode {
        return this.namespace('forClass');
    }

    /**
     * Get the ViewContainer class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get ViewContainer(): string {
        return this.namespace('ViewContainer').value;
    }

    /**
     * Get the prefixed ViewContainer class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get ViewContainerPrefixed(): string {
        return `${this.prefix()}:ViewContainer`;
    }

    /**
     * Get the ViewContainer class as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get ViewContainerNamedNode(): NamedNode {
        return this.namespace('ViewContainer');
    }

    /**
     * Get the TreeViewComponent class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get TreeViewComponent(): string {
        return this.namespace('TreeViewComponent').value;
    }

    /**
     * Get the prefixed TreeViewComponent class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get TreeViewComponentPrefixed(): string {
        return `${this.prefix()}:TreeViewComponent`;
    }

    /**
     * Get the TreeViewComponent class as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get TreeViewComponentNamedNode(): NamedNode {
        return this.namespace('TreeViewComponent');
    }

    /**
     * Get the TreeViewComponent class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get TreeView(): string {
        return this.namespace('TreeView').value;
    }

    /**
     * Get the prefixed TreeViewComponent class.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get TreeViewPrefixed(): string {
        return `${this.prefix()}:TreeView`;
    }

    /**
     * Get the TreeViewComponent class as NamedNode.
     * 
     * @readonly
     * @deprecated Move it to blueprint ontology
     */
    get TreeViewNamedNode(): NamedNode {
        return this.namespace('TreeView');
    }

    /**
     * Get the column predicate.
     * 
     * @readonly
     */
    get column(): string {
        return this.namespace('column').value;
    }

    /**
     * Get the prefixed column predicate.
     * 
     * @readonly
     */
    get columnPrefixed(): string {
        return `${this.prefix()}:column`;
    }

    /**
     * Get the column predicate as NamedNode.
     * 
     * @readonly
     */
    get columnNamedNode(): NamedNode {
        return this.namespace('column');
    }

    /**
     * Get the dataType predicate.
     * 
     * @readonly
     */
    get dataType(): string {
        return this.namespace('dataType').value;
    }

    /**
     * Get the prefixed dataType predicate.
     * 
     * @readonly
     */
    get dataTypePrefixed(): string {
        return `${this.prefix()}:dataType`;
    }

    /**
     * Get the dataType predicate as NamedNode.
     * 
     * @readonly
     */
    get dataTypeNamedNode(): NamedNode {
        return this.namespace('dataType');
    }

    /**
     * Get the hasSettings predicate.
     * 
     * @readonly
     */
    get hasSettings(): string {
        return this.namespace('hasSettings').value;
    }

    /**
     * Get the prefixed hasSettings predicate.
     * 
     * @readonly
     */
    get hasSettingsPrefixed(): string {
        return `${this.prefix()}:hasSettings`;
    }

    /**
     * Get the hasSettings predicate as NamedNode.
     * 
     * @readonly
     */
    get hasSettingsNamedNode(): NamedNode {
        return this.namespace('hasSettings');
    }

    /**
     * Get the isKey predicate.
     * 
     * @readonly
     */
    get isKey(): string {
        return this.namespace('isKey').value;
    }

    /**
     * Get the prefixed isKey predicate.
     * 
     * @readonly
     */
    get isKeyPrefixed(): string {
        return `${this.prefix()}:isKey`;
    }

    /**
     * Get the isKey predicate as NamedNode.
     * 
     * @readonly
     */
    get isKeyNamedNode(): NamedNode {
        return this.namespace('isKey');
    }

    /**
     * Get the isPrimaryKey predicate.
     * 
     * @readonly
     */
    get isPrimaryKey(): string {
        return this.namespace('isPrimaryKey').value;
    }

    /**
     * Get the prefixed isPrimaryKey predicate.
     * 
     * @readonly
     */
    get isPrimaryKeyPrefixed(): string {
        return `${this.prefix()}:isPrimaryKey`;
    }

    /**
     * Get the isPrimaryKey predicate as NamedNode.
     * 
     * @readonly
     */
    get isPrimaryKeyNamedNode(): NamedNode {
        return this.namespace('isPrimaryKey');
    }

    /**
     * Get the references predicate.
     * 
     * @readonly
     */
    get references(): string {
        return this.namespace('references').value;
    }

    /**
     * Get the prefixed references predicate.
     * 
     * @readonly
     */
    get referencesPrefixed(): string {
        return `${this.prefix()}:references`;
    }

    /**
     * Get the references predicate as NamedNode.
     * 
     * @readonly
     */
    get referencesNamedNode(): NamedNode {
        return this.namespace('references');
    }

    /**
     * Get the isInbound predicate.
     * 
     * @readonly
     * 
     */
    get isInbound(): string {
        return this.namespace('isInbound').value;
    }

    /**
     * Get the prefixed isInbound predicate.
     * 
     * @readonly
     */
    get isInboundPrefixed(): string {
        return `${this.prefix()}:isInbound`;
    }

    /**
     * Get the isInbound predicate as NamedNode.
     * 
     * @readonly
     */
    get isInboundNamedNode(): NamedNode {
        return this.namespace('isInbound');
    }

    /**
     * Get the table predicate.
     * 
     * @readonly
     */
    get table(): string {
        return this.namespace('table').value;
    }

    /**
     * Get the prefixed table predicate.
     * 
     * @readonly
     */
    get tablePrefixed(): string {
        return `${this.prefix()}:table`;
    }

    /**
     * Get the table predicate as NamedNode.
     * 
     * @readonly
     */
    get tableNamedNode(): NamedNode {
        return this.namespace('table');
    }

    /**
     * Get the hasViewComponent predicate.
     * 
     * @readonly
     */
    get hasViewComponent(): string {
        return this.namespace('hasViewComponent').value;
    }

    /**
     * Get the prefixed hasViewComponent predicate.
     * 
     * @readonly
     */
    get hasViewComponentPrefixed(): string {
        return `${this.prefix()}:hasViewComponent`;
    }

    /**
     * Get the hasViewComponent predicate as NamedNode.
     * 
     * @readonly
     */
    get hasViewComponentNamedNode(): NamedNode {
        return this.namespace('hasViewComponent');
    }

    /**
     * Get the hasSource predicate.
     * 
     * @readonly
     */
    get hasSource(): string {
        return this.namespace('hasSource').value;
    }

    /**
     * Get the prefixed hasSource predicate.
     * 
     * @readonly
     */
    get hasSourcePrefixed(): string {
        return `${this.prefix()}:hasSource`;
    }

    /**
     * Get the hasSource predicate as NamedNode.
     * 
     * @readonly
     */
    get hasSourceNamedNode(): NamedNode {
        return this.namespace('hasSource');
    }

    /**
     * Get the hasDestination predicate.
     * 
     * @readonly
     */
    get hasDestination(): string {
        return this.namespace('hasDestination').value;
    }

    /**
     * Get the prefixed hasDestination predicate.
     * 
     * @readonly
     */
    get hasDestinationPrefixed(): string {
        return `${this.prefix()}:hasDestination`;
    }

    /**
     * Get the hasDestination predicate as NamedNode.
     * 
     * @readonly
     */
    get hasDestinationNamedNode(): NamedNode {
        return this.namespace('hasDestination');
    }

    /**
     * Get the hasCenter predicate.
     * 
     * @readonly
     */
    get hasCenter(): string {
        return this.namespace('hasCenter').value;
    }

    /**
     * Get the prefixed hasCenter predicate.
     * 
     * @readonly
     */
    get hasCenterPrefixed(): string {
        return `${this.prefix()}:hasCenter`;
    }

    /**
     * Get the hasCenter predicate as NamedNode.
     * 
     * @readonly
     */
    get hasCenterNamedNode(): NamedNode {
        return this.namespace('hasCenter');
    }






}

export const nileaUi = new NileaUiOntology();
