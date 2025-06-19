

import { rdfEnvironment, RdfTypes, NamespaceBuilder } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class FluxOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('https://flux.described.at/'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'blueprint';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the icon predicate.
     * 
     * @readonly
     */
    get icon(): string {
        return this.namespace('icon').value;
    }

    /**
     * Get the prefixed icon predicate.
     * 
     * @readonly
     */
    get iconPrefixed(): string {
        return `${this.prefix()}:icon`;
    }

    /**
     * Get the icon predicate as NamedNode.
     */

    get iconNamedNode(): RdfTypes.NamedNode {
        return this.namespace('icon');
    }

    /**
     * Get the faIcon predicate.
     * @deprecated use {@link getIconPrefixed} or {@link getIcon} instead
     * 
     * @readonly
     */
    get faIcon(): string {
        return this.namespace('faIcon').value;
    }

    /** 
     * Get the prefixed faIcon predicate.
     * 
     * @deprecated use {@link getIconPrefixed} or {@link getIcon} instead
     * 
     * @readonly
    */
    get faIconPrefixed(): string {
        return `${this.prefix()}:faIcon`;
    }

    /**
     * Get the faIcon predicate as NamedNode.
     * 
     * @deprecated use {@link getIconPrefixed} or {@link getIcon} instead
     * 
     * @readonly
     */
    get faIconNamedNode(): RdfTypes.NamedNode {
        return this.namespace('faIcon');
    }

    /**
     * get the prefixed icon predicate
     * 
     * @readonly
     */
    get colorIndex(): string {
        return this.namespace('colorIndex').value;
    }

    /**
     * get the prefixed icon predicate
     * 
     * @readonly
     */
    get colorIndexPrefixed(): string {
        return `${this.prefix()}:colorIndex`;
    }

    /**
     * Get the colorIndex predicate as NamedNode.
     * 
     * @readonly
     */
    get colorIndexNamedNode(): RdfTypes.NamedNode {
        return this.namespace('colorIndex');
    }

    /**
     * @returns {string} prefixed icon
     */
    get searchPriority(): string {
        return this.namespace('searchPrio').value;
    }

    /**
     * Get the prefixed search priority predicate.
     * 
     * @readonly
     */
    get searchPriorityPrefixed(): string {
        return `${this.prefix()}:searchPrio`;
    }

    /**
     * Get the search priority predicate as NamedNode.
     * 
     * @readonly
     */
    get searchPriorityNamedNode(): RdfTypes.NamedNode {
        return this.namespace('searchPrio');
    }

    /**
     * @deprecated i think we don't need it anymore
     * 
     * @readonly
     */
    get showIn() {
        return this.namespace('showIn').value;
    }

    /**
     * @deprecated i think we don't need it anymore
     * 
     * @readonly
     */
    get showInPrefixed() {
        return `${this.prefix()}:showIn`;
    }

    /**
     * @deprecated i think we don't need it anymore
     * 
     * @readonly
     */
    get showInNamedNode(): RdfTypes.NamedNode {
        return this.namespace('showIn');
    }

    /**
     * Get the has root predicate.
     * 
     * @readonly
     */
    get hasRoot() {
        return this.namespace('hasRoot').value;
    }

    /**
     * Get the prefixed has root predicate.
     * 
     * @readonly
     */
    get hasRootPrefixed() {
        return `${this.prefix()}:hasRoot`;
    }

    /**
     * Get the has root predicate as NamedNode.
     * 
     * @readonly
     */
    get hasRootNamedNode(): RdfTypes.NamedNode {
        return this.namespace('hasRoot');
    }

    /**
     * Get the has showAs predicate.
     * 
     * @readonly
     */
    get showAs() {
        return this.namespace('showAs').value;
    }

    /**
     * Get the prefixed has showAs predicate.
     * 
     * @readonly
     */
    get showAsPrefixed() {
        return `${this.prefix()}:showAs`;

    }

    /**
     * Get the has showAs predicate as NamedNode.
     * 
     * @readonly
     */
    get showAsNamedNode(): RdfTypes.NamedNode {
        return this.namespace('showAs');
    }

    /**
     * Get the has detail predicate.
     * 
     * @readonly
     */
    get detail() {
        return this.namespace('detail').value;
    }

    /**
     * Get the prefixed has detail predicate.
     */
    get detailPrefixed() {
        return `${this.prefix()}:detail`;
    }

    /** 
     * Get the has detail predicate as NamedNode.
     */
    get detailNamedNode(): RdfTypes.NamedNode {
        return this.namespace('detail');
    }

    /**
     * Get the has value predicate.
     * 
     * @readonly
     */
    get value() {
        return this.namespace('value').value;
    }

    /**
     * Get the prefixed has value predicate.
     * 
     * @readonly
     */
    get valuePrefixed() {
        return `${this.prefix()}:value`;
    }

    /**
     * Get the has value predicate as NamedNode.
     * 
     * @readonly
     */
    get valueNamedNode(): RdfTypes.NamedNode {
        return this.namespace('value');
    }

    // class
    /**
     * Get the Hierarchy class.
     * 
     * @readonly
     */
    get Hierarchy() {
        return this.namespace('Hierarchy').value;
    }

    /**
     * Get the prefixed Hierarchy class.
     * 
     * @readonly
     */
    get HierarchyPrefixed() {
        return `${this.prefix()}:Hierarchy`;
    }

    /**
     * Get the Hierarchy class as NamedNode.
     * 
     * @readonly
     */
    get HierarchyNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Hierarchy');
    }


    /**
     * Get linkLabel predicate.
     * 
     * @readonly
     */
    get linkLabel() {
        return this.namespace('linkLabel').value;
    }

    /**
     * Get the prefixed linkLabel predicate.
     * 
     * @readonly
     */
    get linkLabelPrefixed() {
        return `${this.prefix()}:linkLabel`;
    }

    /**
     * Get the linkLabel predicate as NamedNode.
     * 
     * @readonly
     */
    get linkLabelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('linkLabel');
    }

    /**
     * Get the has label predicate.
     * 
     * @readonly
     */
    get label() {
        return this.namespace('label').value;
    }

    /**
     * Get the prefixed has label predicate.
     * 
     * @readonly
     */
    get labelPrefixed() {
        return `${this.prefix()}:label`;
    }

    /**
     * Get the has label predicate as NamedNode.
     * 
     * @readonly
     */
    get labelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('label');
    }

    /**
     * Get the Table class.
     * 
     * @readonly
     */
    get Table() {
        return this.namespace('Table').value;
    }

    /**
     * Get the prefixed Table class.
     * 
     * @readonly
     */
    get TablePrefixed() {
        return `${this.prefix()}:Table`;
    }

    /**
     * Get the Table class as NamedNode.
     * 
     * @readonly
     */
    get TableNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Table');
    }

    /**
     * Get the hasHeader predicate.
     * 
     * @readonly
     */
    get hasHeader() {
        return this.namespace('hasHeader').value;
    }

    /**
     * Get the prefixed hasHeader predicate.
     * 
     * @readonly
     */
    get hasHeaderPrefixed() {
        return `${this.prefix()}:hasHeader`;
    }

    /**
     * Get the hasHeader predicate as NamedNode.
     * 
     * @readonly
     */
    get hasHeaderNamedNode(): RdfTypes.NamedNode {
        return this.namespace('hasHeader');
    }

    /**
     * Get the columnIndex predicate.
     * 
     * @readonly
     */
    get columnIndex(): string {
        return this.namespace('columnIndex').value;
    }

    /**
     * Get the prefixed columnIndex predicate.
     * 
     * @readonly
     */
    get columnIndexPrefixed(): string {
        return `${this.prefix()}:columnIndex`;
    }

    /**
     * Get the columnIndex predicate as NamedNode.
     * 
     * @readonly
     */
    get columnIndexNamedNode(): RdfTypes.NamedNode {
        return this.namespace('columnIndex');
    }

    /**
     * Get the key predicate.
     * 
     * @readonly
     */
    get key(): string {
        return this.namespace('key').value;
    }

    /**
     * Get the prefixed key predicate.
     * 
     * @readonly
     */
    get keyPrefixed(): string {
        return `${this.prefix()}:key`;
    }

    /**
     * Get the key predicate as NamedNode.
     * 
     * @readonly
     */
    get keyNamedNode(): RdfTypes.NamedNode {
        return this.namespace('key');
    }

    /**
     * Get the hasRow predicate.
     * 
     * @readonly
     */
    get hasRow(): string {
        return this.namespace('hasRow').value;
    }

    /**
     * Get the prefixed hasRow predicate.
     * 
     * @readonly
     */
    get hasRowPrefixed(): string {
        return `${this.prefix()}:hasRow`;
    }

    /**
     * Get the hasRow predicate as NamedNode.
     * 
     * @readonly
     */
    get hasRowNamedNode(): RdfTypes.NamedNode {
        return this.namespace('hasRow');
    }

    /**
     * Get the cell predicate.
     * 
     * @readonly
     */
    get cell(): string {
        return this.namespace('cell').value;
    }

    /**
     * Get the prefixed cell predicate.
     * 
     * @readonly
     */
    get cellPrefixed(): string {
        return `${this.prefix()}:cell`;
    }

    /**
     * Get the cell predicate as NamedNode.
     * 
     * @readonly
     */
    get cellNamedNode(): RdfTypes.NamedNode {
        return this.namespace('cell');
    }

    /**
     * Get the instance predicate.
     * 
     * @readonly
     */
    get instance(): string {
        return this.namespace('instance').value;
    }

    /**
     * Get the prefixed instance predicate.
     * 
     * @readonly
     */
    get instancePrefixed(): string {
        return `${this.prefix()}:instance`;
    }

    /**
     * Get the instance predicate as NamedNode.
     * 
     * @readonly
     */
    get instanceNamedNode(): RdfTypes.NamedNode {
        return this.namespace('instance');
    }

    /**
     * Get the child predicate.
     * 
     * @readonly
     */
    get child(): string {
        return this.namespace('child').value;
    }

    /**
     * Get the prefixed child predicate.
     * 
     * @readonly
     */
    get childPrefixed(): string {
        return `${this.prefix()}:child`;
    }

    /**
     * Get the child predicate as NamedNode.
     * 
     * @readonly
     */
    get childNamedNode(): RdfTypes.NamedNode {
        return this.namespace('child');
    }

    /**
     * Get the Child class.
     */
    get Child(): string {
        return this.namespace('Child').value;
    }

    /**
     * Get the prefixed Child class.
     * 
     * @readonly
     */
    get ChildPrefixed(): string {
        return `${this.prefix()}:Child`;
    }

    /**
     * Get the Child class as NamedNode.
     * 
     * @readonly
     */
    get ChildNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Child');
    }

    /**
     * Get the TreeNode class.
     */
    get TreeNode(): string {
        return this.namespace('TreeNode').value;
    }

    /**
     * Get the prefixed TreeNode class.
     * 
     * @readonly
     */
    get TreeNodePrefixed(): string {
        return `${this.prefix()}:TreeNode`;
    }

    /**
     * Get the TreeNode class as NamedNode.
     * 
     * @readonly
     */
    get TreeNodeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('TreeNode');
    }

    /**
     * Get the TreeRoot class.
     * 
     * @readonly
     */
    get TreeRoot(): string {
        return this.namespace('TreeRoot').value;
    }

    /**
     * Get the prefixed TreeRoot class.
     * 
     * @readonly
     */
    get TreeRootPrefixed(): string {
        return `${this.prefix()}:TreeRoot`;
    }

    /**
     * Get the TreeRoot class as NamedNode.
     * 
     * @readonly
     */
    get TreeRootNamedNode(): RdfTypes.NamedNode {
        return this.namespace('TreeRoot');
    }

    /**
     * Get the score predicate.
     * 
     * @readonly
     */
    get score(): string {
        return this.namespace('score').value;
    }

    /**
     * Get the prefixed score predicate.
     * 
     * @readonly
     */
    get scorePrefixed(): string {
        return `${this.prefix()}:score`;
    }

    /**
     * Get the score predicate as NamedNode.
     * 
     * @readonly
     */
    get scoreNamedNode(): RdfTypes.NamedNode {
        return this.namespace('score');
    }

    /**
     * Get the count predicate.
     * 
     * @readonly
     */
    get count(): string {
        return this.namespace('count').value;
    }

    /**
     * Get the prefixed count predicate.
     * 
     * @readonly
     */
    get countPrefixed(): string {
        return `${this.prefix()}:count`;
    }

    /**
     * Get the count predicate as NamedNode.
     * 
     * @readonly
     */
    get countNamedNode(): RdfTypes.NamedNode {
        return this.namespace('count');
    }

    /**
     * Get the result predicate.
     * 
     * @readonly
     */
    get result(): string {
        return this.namespace('result').value;
    }

    /**
     * Get the prefixed result predicate.
     * 
     * @readonly
     */
    get resultPrefixed(): string {
        return `${this.prefix()}:result`;
    }

    /**
     * Get the result predicate as NamedNode.
     * 
     * @readonly
     */
    get resultNamedNode(): RdfTypes.NamedNode {
        return this.namespace('result');
    }

    /**
     * Get the pageSize predicate.
     * 
     * @readonly
     */
    get pageSize(): string {
        return this.namespace('pageSize').value;
    }

    /**
     * Get the prefixed pageSize predicate.
     * 
     * @readonly
     */
    get pageSizePrefixed(): string {
        return `${this.prefix()}:pageSize`;
    }

    /**
     * Get the pageSize predicate as NamedNode.
     * 
     * @readonly
     */
    get pageSizeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('pageSize');
    }

    /**
     * Get the pageNumber predicate.
     * 
     * @readonly
     */
    get pageNumber(): string {
        return this.namespace('pageNumber').value;
    }

    /**
     * Get the prefixed pageNumber predicate.
     * 
     * @readonly
     */
    get pageNumberPrefixed(): string {
        return `${this.prefix()}:pageNumber`;
    }

    /**
     * Get the pageNumber predicate as NamedNode.
     * 
     * @readonly
     */
    get pageNumberNamedNode(): RdfTypes.NamedNode {
        return this.namespace('pageNumber');
    }

    /**
     * Get the total predicate.
     * 
     * @readonly
     */
    get total(): string {
        return this.namespace('total').value;
    }

    /**
     * Get the prefixed total predicate.
     * 
     * @readonly
     */
    get totalPrefixed(): string {
        return `${this.prefix()}:total`;
    }

    /**
     * Get the total predicate as NamedNode.
     * 
     * @readonly
     */
    get totalNamedNode(): RdfTypes.NamedNode {
        return this.namespace('total');
    }

    /**
     * Get the query predicate.
     * 
     * @readonly
     */
    get query(): string {
        return this.namespace('query').value;
    }

    /**
     * Get the prefixed query predicate.
     * 
     * @readonly
     */
    get queryPrefixed(): string {
        return `${this.prefix()}:query`;
    }

    /**
     * Get the query predicate as NamedNode.
     * 
     * @readonly
     */
    get queryNamedNode(): RdfTypes.NamedNode {
        return this.namespace('query');
    }

    /**
     * Get the UiClassCount class.
     * 
     * @readonly
     */
    get UiClassCount(): string {
        return this.namespace('UiClassCount').value;
    }

    /**
     * Get the prefixed UiClassCount class.
     * 
     * @readonly
     */
    get UiClassCountPrefixed(): string {
        return `${this.prefix()}:UiClassCount`;
    }

    /**
     * Get the UiClassCount class as NamedNode.
     * 
     * @readonly
     */
    get UiClassCountNamedNode(): RdfTypes.NamedNode {
        return this.namespace('UiClassCount');
    }

    /**
     * Get the UiSearchResult class.
     * 
     * @readonly
     */
    get UiSearchResult(): string {
        return this.namespace('UiSearchResult').value;
    }

    /**
     * Get the prefixed UiSearchResult class.
     * 
     * @readonly
     */
    get UiSearchResultPrefixed(): string {
        return `${this.prefix()}:UiSearchResult`;
    }

    /**
     * Get the UiSearchResult class as NamedNode.
     * 
     * @readonly
     */
    get UiSearchResultNamedNode(): RdfTypes.NamedNode {
        return this.namespace('UiSearchResult');
    }

    /**
     * Get the UiSearchResultItem class.
     * 
     * @readonly
     */
    get UiSearchResultItem(): string {
        return this.namespace('UiSearchResultItem').value;
    }

    /**
     * Get the prefixed UiSearchResultItem class.
     * 
     * @readonly
     */
    get UiSearchResultItemPrefixed(): string {
        return `${this.prefix()}:UiSearchResultItem`;
    }

    /**
     * Get the UiSearchResultItem class as NamedNode.
     * 
     * @readonly
     */
    get UiSearchResultItemNamedNode(): RdfTypes.NamedNode {
        return this.namespace('UiSearchResultItem');
    }

    /**
     * Get the parent predicate.
     * 
     * @readonly
     */
    get parent(): string {
        return this.namespace('parent').value;
    }

    /**
     * Get the prefixed parent predicate.
     * 
     * @readonly
     */
    get parentPrefixed(): string {
        return `${this.prefix()}:parent`;
    }

    /**
     * Get the parent predicate as NamedNode.
     * 
     * @readonly
     */
    get parentNamedNode(): RdfTypes.NamedNode {
        return this.namespace('parent');
    }

    /**
     * Get the hasUiLink predicate.
     * 
     * @readonly
     */
    get hasUiLink(): string {
        return this.namespace('hasUiLink').value;
    }

    /**
     * Get the prefixed hasUiLink predicate.
     * 
     * @readonly
     */
    get hasUiLinkPrefixed(): string {
        return `${this.prefix()}:hasUiLink`;
    }

    /**
     * Get the hasUiLink predicate as NamedNode.
     * 
     * @readonly
     */
    get hasUiLinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('hasUiLink');
    }

    /**
     * Get the Link class.
     * 
     * @readonly
     */
    get Link(): string {
        return this.namespace('Link').value;
    }

    /**
     * Get the prefixed Link class.
     * 
     * @readonly
     */
    get LinkPrefixed(): string {
        return `${this.prefix()}:Link`;
    }

    /**
     * Get the Link class as NamedNode.
     * 
     * @readonly
     */
    get LinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Link');
    }

    /**
     * Get the link predicate.
     * 
     * @readonly
     */
    get link(): string {
        return this.namespace('link').value;
    }

    /**
     * Get the prefixed link predicate.
     * 
     * @readonly
     */
    get linkPrefixed(): string {
        return `${this.prefix()}:link`;
    }

    /**
     * Get the link predicate as NamedNode.
     * 
     * @readonly
     */
    get linkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('link');
    }

    /**
     * Get the UiNode class.
     * 
     * @readonly
     */
    get UiNode(): string {
        return this.namespace('UiNode').value;
    }

    /**
     * Get the prefixed UiNode class.
     * 
     * @readonly
     */
    get UiNodePrefixed(): string {
        return `${this.prefix()}:UiNode`;
    }

    /**
     * Get the UiNode class as NamedNode.
     * 
     * @readonly
     */
    get UiNodeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('UiNode');
    }

    /**
     * Get Container class.
     * 
     * @readonly
     */
    get Container(): string {
        return this.namespace('Container').value;
    }

    /**
     * Get the prefixed Container class.
     * 
     * @readonly
     */
    get ContainerPrefixed(): string {
        return `${this.prefix()}:Container`;
    }

    /**
     * Get the Container class as NamedNode.
     * 
     * @readonly
     */
    get ContainerNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Container');
    }

    /**
     * Get the Composition class.
     * 
     * @readonly
     */
    get Composition(): string {
        return this.namespace('Composition').value;
    }

    /**
     * Get the prefixed Composition class.
     * 
     * @readonly
     */
    get CompositionPrefixed(): string {
        return `${this.prefix()}:Composition`;
    }

    /**
     * Get the Composition class as NamedNode.
     * 
     * @readonly
     */
    get CompositionNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Composition');
    }

    /**
     * Get the CompositionToCompositionLink class.
     * 
     * @readonly
     */
    get CompositionToCompositionLink(): string {
        return this.namespace('CompositionToCompositionLink').value;
    }

    /**
     * Get the prefixed CompositionToCompositionLink class.
     * 
     * @readonly
     */
    get CompositionToCompositionLinkPrefixed(): string {
        return `${this.prefix()}:CompositionToCompositionLink`;
    }

    /**
     * Get the CompositionToCompositionLink class as NamedNode.
     * 
     * @readonly
     */
    get CompositionToCompositionLinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('CompositionToCompositionLink');
    }

    /**
     * Get the CompositionToNodeLink class.
     * 
     * @readonly
     */
    get CompositionToNodeLink(): string {
        return this.namespace('CompositionToNodeLink').value;
    }

    /**
     * Get the prefixed CompositionToNodeLink class.
     * 
     * @readonly
     */
    get CompositionToNodeLinkPrefixed(): string {
        return `${this.prefix()}:CompositionToNodeLink`;
    }

    /**
     * Get the CompositionToNodeLink class as NamedNode.
     * 
     * @readonly
     */
    get CompositionToNodeLinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('CompositionToNodeLink');
    }

    /**
     * Get the source predicate.
     * 
     * @readonly
     */
    get source(): string {
        return this.namespace('source').value;
    }

    /**
     * Get the prefixed source predicate.
     * 
     * @readonly
     */
    get sourcePrefixed(): string {
        return `${this.prefix()}:source`;
    }

    /**
     * Get the source predicate as NamedNode.
     * 
     * @readonly
     */
    get sourceNamedNode(): RdfTypes.NamedNode {
        return this.namespace('source');
    }

    /**
     * Get the target predicate.
     * 
     * @readonly
     */
    get target(): string {
        return this.namespace('target').value;
    }

    /**
     * Get the prefixed target predicate.
     * 
     * @readonly
     */
    get targetPrefixed(): string {
        return `${this.prefix()}:target`;
    }

    /**
     * Get the target predicate as NamedNode.
     * 
     * @readonly
     */
    get targetNamedNode(): RdfTypes.NamedNode {
        return this.namespace('target');
    }

    /**
     * Get the inverseLabel predicate.
     * 
     * @readonly
     */
    get inverseLabel(): string {
        return this.namespace('inverseLabel').value;
    }

    /**
     * Get the prefixed inverseLabel predicate.
     * 
     * @readonly
     */
    get inverseLabelPrefixed(): string {
        return `${this.prefix()}:inverseLabel`;
    }

    /**
     * Get the inverseLabel predicate as NamedNode.
     * 
     * @readonly
     */
    get inverseLabelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('inverseLabel');
    }

    /**
     * Get the ConnectionPoint class.
     * 
     * @readonly
     */
    get ConnectionPoint(): string {
        return this.namespace('ConnectionPoint').value;
    }

    /**
     * Get the prefixed ConnectionPoint class.
     * 
     * @readonly
     */
    get ConnectionPointPrefixed(): string {
        return `${this.prefix()}:ConnectionPoint`;
    }

    /**
     * Get the ConnectionPoint class as NamedNode.
     * 
     * @readonly
     */
    get ConnectionPointNamedNode(): RdfTypes.NamedNode {
        return this.namespace('ConnectionPoint');
    }

    /**
     * Get the CompositionLinkResult class.
     * 
     * @readonly
     */
    get CompositionLinkResult(): string {
        return this.namespace('CompositionLinkResult').value;
    }

    /**
     * Get the prefixed CompositionLinkResult class.
     * 
     * @readonly
     */
    get CompositionLinkResultPrefixed(): string {
        return `${this.prefix()}:CompositionLinkResult`;
    }

    /**
     * Get the CompositionLinkResult class as NamedNode.
     * 
     * @readonly
     */
    get CompositionLinkResultNamedNode(): RdfTypes.NamedNode {
        return this.namespace('CompositionLinkResult');
    }

    /**
     * Get the x predicate.
     * 
     * @readonly
     */
    get x(): string {
        return this.namespace('x').value;
    }

    /**
     * Get the prefixed x predicate.
     * 
     * @readonly
     */
    get xPrefixed(): string {
        return `${this.prefix()}:x`;
    }
    /**
     * Get the x predicate as NamedNode.
     * 
     * @readonly
     */
    get xNamedNode(): RdfTypes.NamedNode {
        return this.namespace('x');
    }

    /**
     * Get the y predicate.
     * 
     * @readonly
     */
    get y(): string {
        return this.namespace('y').value;
    }
    /**
     * Get the prefixed y predicate.
     * 
     * @readonly
     */
    get yPrefixed(): string {
        return `${this.prefix()}:y`;
    }

    /**
     * Get the y predicate as NamedNode.
     * 
     * @readonly
     */
    get yNamedNode(): RdfTypes.NamedNode {
        return this.namespace('y');
    }

    /**
     * Get the index predicate.
     * 
     * @readonly
     */
    get index(): string {
        return this.namespace('index').value;
    }

    /**
     * Get the prefixed index predicate.
     * 
     * @readonly
     */
    get indexPrefixed(): string {
        return `${this.prefix()}:index`;
    }
    /**
     * Get the index predicate as NamedNode.
     * 
     * @readonly
     */
    get indexNamedNode(): RdfTypes.NamedNode {
        return this.namespace('index');
    }

    /**
     * Get the inferredType predicate.
     */
    get inferredType(): string {
        return this.namespace('inferredType').value;
    }
    /**
     * Get the prefixed inferredType predicate.
     */
    get inferredTypePrefixed(): string {
        return `${this.prefix()}:inferredType`;
    }
    /**
     * Get the inferredType predicate as NamedNode.
     */
    get inferredTypeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('inferredType');
    }

    /**
     * Get ConsolidatedLink class.
     * 
     * @readonly
     */
    get ConsolidatedLink(): string {
        return this.namespace('ConsolidatedLink').value;
    }
    /**
     * Get the prefixed ConsolidatedLink class.
     * 
     * @readonly
     */
    get ConsolidatedLinkPrefixed(): string {
        return `${this.prefix()}:ConsolidatedLink`;
    }
    /**
     * Get the ConsolidatedLink class as NamedNode.
     * 
     * @readonly
     */
    get ConsolidatedLinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('ConsolidatedLink');
    }

    /**
     * Get the hasChildLink predicate.
     * 
     * @readonly
     */
    get hasChildLink(): string {
        return this.namespace('hasChildLink').value;
    }

    /**
     * Get the prefixed hasChildLink predicate.
     * 
     * @readonly
     */
    get hasChildLinkPrefixed(): string {
        return `${this.prefix()}:hasChildLink`;
    }
    /**
     * Get the hasChildLink predicate as NamedNode.
     * 
     * @readonly
     */
    get hasChildLinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('hasChildLink');
    }

    /**
     * Get ChildLink class . 
     * 
     * @readonly
     */
    get ChildLink(): string {
        return this.namespace('ChildLink').value;
    }

    /**
     * Get the prefixed ChildLink class.
     * 
     * @readonly
     */
    get ChildLinkPrefixed(): string {
        return `${this.prefix()}:ChildLink`;
    }

    /**
     * Get the ChildLink class as NamedNode.
     * 
     * @readonly
     */
    get ChildLinkNamedNode(): RdfTypes.NamedNode {
        return this.namespace('ChildLink');
    }

}

export const flux = new FluxOntology();
