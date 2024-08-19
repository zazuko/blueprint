import RDF from '@rdfjs/types';
import rdfEnvironment from '@zazuko/env';
import { AnyPointer } from 'clownface';

import { blueprint, rdfs, rdf, shacl, appLocal, nileaUi, blueprintShape } from '@blueprint/ontology';
import { Avatar } from '@blueprint/component/avatar/avatar.component';
import { RdfUiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { Aggregation } from '@blueprint/service/graph/aggregate/model/aggregation';
import { HierarchyNode } from './hierarchy-node.model';
export class HierarchyDefinition extends Aggregation {

    private _label: string | null = null;
    private _description: string | null = null;
    private _rootNode: HierarchyNode | null | undefined = undefined;
    private _avatars: Avatar[] | null = null;

    /**
     * 
     * @param node The node of the hierarchy. Pointer into the dataset.
     * @param dataset The dataset that contains the hierarchy.
     */
    constructor(node: RDF.NamedNode, dataset: RDF.Dataset) {
        const hierarchyGraph = rdfEnvironment.clownface({ dataset }).node(node);
        super(hierarchyGraph);
    }

    /**   
     * The label of the hierarchy.
     * 
     * @readonly
     */
    get label(): string {
        if (this._label === null) {
            const labels = this._node.out(rdfs.labelNamedNode).values;
            if (labels.length === 0) {
                console.warn(`Hierarchy ${this._node.value} has no label. Defaulting to ''.`);
                this._label = '';
            } else {
                if (labels.length > 1) {
                    console.warn(`Hierarchy ${this._node.value} has ${labels.length} labels. Expected 1. Using first label.`);
                }
                this._label = labels[0];
            }
        }
        return this._label;
    }

    /**
     * The comment of the hierarchy.
     * 
     * @readonly
     */
    get description(): string {
        if (this._description === null) {
            const comments = this._node.out(rdfs.commentNamedNode).values;
            if (comments.length === 0) {
                console.warn(`Hierarchy ${this._node.value} has no comment. Defaulting to ''.`);
                this._description = '';
            }
            else if (comments.length > 1) {
                console.warn(`Hierarchy ${this._node.value} has ${comments.length} comments. Expected 1. Joining comments.`);
                this._description = comments.join('\n');
            } else {
                this._description = comments[0];
            }
        }
        return this._description;
    }

    /**
     * The avatars of the hierarchy.
     * 
     * @readonly
     */
    get avatars(): Avatar[] {
        if (this._avatars === null) {
            const uiClassMetadatas = this._node.in(shacl.groupNamedNode).out(shacl.targetClassNamedNode).in(shacl.targetNodeNamedNode).has(rdf.typeNamedNode, blueprintShape.ClassMetadataShapeNamedNode).map(metaNode => new RdfUiClassMetadata(metaNode));
            this._avatars = uiClassMetadatas.map(uiClassMetadata => {
                return {
                    label: uiClassMetadata.label,
                    icon: uiClassMetadata.icon,
                    color: uiClassMetadata.color
                };
            });

        }
        return this._avatars;
    }

    get contentList(): ContentItem[] {
        const uiClassMetadatas = this._node.in(shacl.groupNamedNode).out(shacl.targetClassNamedNode).in(shacl.targetNodeNamedNode).has(rdf.typeNamedNode, blueprintShape.ClassMetadataShapeNamedNode).map(metaNode => new RdfUiClassMetadata(metaNode));
        return uiClassMetadatas.map(meta => {
            return {
                label: meta.label,
                iri: meta.targetNode.value,
                avatar: {
                    label: meta.label,
                    icon: meta.icon,
                    color: meta.color
                }
            };
        });
    }

    get contentLabels(): string[] {
        return this.contentList.map(item => item.label);
    }

    /**
     * The root node of the hierarchy.
     * 
     * @readonly
     */
    get rootNode(): HierarchyNode | null {
        if (this._rootNode === undefined) {
            const root = this._node.out(blueprint.hasRootNamedNode);
            if (root.values.length === 1) {
                const nodeNode = rdfEnvironment.namedNode(root.value);
                const rootCfNode = rdfEnvironment.clownface({ dataset: this._node.dataset }).node(nodeNode);
                this._rootNode = new HierarchyNode(rootCfNode);
            } else {
                console.warn(`Hierarchy ${this._node.value}> has ${root.values.length} root nodes. Expected 1. Wr do not provide a root node.`);
                this._rootNode = null;
            }
        }
        return this._rootNode;
    }

    /**
     * A tree can be shown as a table if all nodes have exactly one child.
     * 
     * @returns {boolean} true if the tree can be shown as a table.
     */
    isTable(): boolean {
        const root = this.rootNode;
        if (root) {
            const queue = [root];
            while (queue.length > 0) {
                const node = queue.shift();
                if (node) {
                    if (node.children.length > 1) {
                        return false;
                    }
                    queue.push(...node.children);
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Get the sparql query to retrieve the data for the view
     * 
     * @param typeIri the type of the subject
     * @returns the sparql query to retrieve the data for the view
     */
    getViewQuerySparqlTemplate(typeIri: string, viewIri: string): string {
        return this._downStreamTeeQuery(typeIri, viewIri);
    }


    getDataSparqlQueryForType(type: string): string {
        const node = this._node.in(shacl.groupNamedNode).has(shacl.targetClassNamedNode, rdfEnvironment.namedNode(type));
        const nodesToRoot = this._collectNodesToRoot(node);
        const query = nodesToRoot.map((_node, index) => this._queryForNode(index, nodesToRoot)).join(' UNION \n');

        const queryHead = `
        ${shacl.sparqlPrefix()}
        ${rdfs.sparqlPrefix()}
        ${rdf.sparqlPrefix()}
        ${blueprint.sparqlPrefix()}
        ${appLocal.sparqlPrefix()}
        
        CONSTRUCT {
           ?componentIri ${blueprint.labelPrefixed} ?viewLabel .
           ?componentIri ${rdf.typePrefixed} ?treeType .
           ?componentIri ${appLocal.resultPrefixed} ?resultIri .
           ?resultIri ${appLocal.elementPrefixed} ?newIri .
           ?newIri ${appLocal.indexPrefixed} ?index .
           ?newIri ${appLocal.labelPrefixed} ?label .
           ?newIri ${appLocal.classLabelPrefixed} ?classLabel .
           ?newIri ${appLocal.iriPrefixed} ?parent .
           ?newIri ${appLocal.iconPrefixed} ?icon .
           ?newIri ${appLocal.colorIndexPrefixed} ?colorIndex .
        
        } WHERE {
        `;

        return `${queryHead} ${query} }`;
    }

    /**
     * 
     * @param index the depth of the node
     * @param nodesToRoot these are the nodes from the node to the root
     * @returns a sparql query block for the node or null if the node is the root node
     */
    private _queryForNode(index: number, nodesToRoot: AnyPointer[]): string | null {
        if (index === 0) {
            const target = nodesToRoot[index].out(shacl.targetClassNamedNode).value;

            return this._elementQuery(index, target);
        }

        const previousNodes = nodesToRoot.slice(0, index);
        const previousNodePaths = previousNodes.map(previousNode => this._propertyPathToParent(previousNode.in(shacl.nodeNamedNode).out(shacl.pathNamedNode)));
        const target = nodesToRoot[index].out(shacl.targetClassNamedNode).value;

        return this._elementQuery(index, target, previousNodePaths.join('/'));
    }

    _collectNodesToRoot(node: AnyPointer, arr: AnyPointer[] = []): AnyPointer[] {
        arr.push(node);
        const parent = node.in(shacl.nodeNamedNode).in(shacl.propertyNamedNode);
        if (parent.values.length > 0) {
            return this._collectNodesToRoot(parent, arr);
        }
        return arr;
    }


    private _elementQuery(index: number, targetClassIri: string, propertyPath?: string): string {
        const focusObjectParent1 = propertyPath ? `?subject ${propertyPath} ?parent.\n ?parent rdfs:label ?label.` : '?subject rdfs:label ?label.';
        const focusObjectParent2 = propertyPath ? `?subject ${propertyPath} ?parent.\n ?parent rdf:type ?class.` : '?subject rdf:type ?class.';
        const viewLabelQuery = propertyPath ? `` : '?member rdfs:label ?viewLabel .';


        const queryBlock = `
        {
            ?componentIri ${rdf.typePrefixed} ?treeType .
            BIND (${index} as ?index)  
            BIND(IRI(CONCAT(STR(?componentIri), "/element", STR(?index))) AS ?newIri)
              {
                ${focusObjectParent1}
               ?parent ${rdfs.labelPrefixed} ?label .
                ?parent ${rdf.typePrefixed} <${targetClassIri}> .
               BIND (${index} as ?index)  
            }
            UNION
            {
               {
                    SELECT ?metaShape ?subject ?componentIri ?class ?viewLabel WHERE {
                        BIND (<${targetClassIri}> as ?class)
                        ${focusObjectParent2}
                        ?metaShape ${shacl.targetNodePrefixed} ?class.  
                        ?member ${shacl.groupPrefixed} ?componentIri . 
                        ?member ${shacl.targetClassPrefixed} ?class .
                        ${viewLabelQuery}
                    }
               }
            
               ?metaShape ${blueprint.faIconPrefixed} ?icon ;
                  ${blueprint.colorIndexPrefixed} ?colorIndex ; 
                  ${rdfs.labelPrefixed} ?classLabel .
               
               BIND(IRI(CONCAT(STR(?componentIri), '/result')) AS ?resultIri)
            }
         }`;

        return queryBlock;
    }

    private _propertyPathToParent(path: AnyPointer): string {
        if (path.values.length !== 1) {
            return '';
        }
        if (path.term.termType === 'BlankNode') {
            const inverse = path.out(shacl.inversePathNamedNode);
            if (inverse.values.length === 1) {
                return `<${inverse.value}>`;
            }
            return '';
        }
        return `^<${path.value}>`;
    }

    getDataTableSparqlQuery(): string {
        const root = this.rootNode;
        // Breadth-first (BFS) traversal 
        const allChildNodes = this._collectAllChildNodes(root);

        const vars = allChildNodes.map((_node, index) => {
            return `?var_${index}`;
        }
        )
        const constructHead = `
        ${rdfs.sparqlPrefix()}
        ${blueprint.sparqlPrefix()}
        ${shacl.sparqlPrefix()}

        PREFIX data: <http://localhost/data/>

        CONSTRUCT {
            data:TableInstance a ${blueprint.TablePrefixed} .
            data:TableInstance ${blueprint.hasHeaderPrefixed} ?header .
            ?header ?tableP ?metaO .
            ?header ${blueprint.colorIndexPrefixed} ?columnIndex .
          
            ?instance a ?class .
            ?instance ${rdfs.labelPrefixed} ?label .
            ?instance ${blueprint.keyPrefixed} ?key .
          
            data:TableInstance ${blueprint.hasRowPrefixed} ?row .
            ?row ${blueprint.cellPrefixed} ${vars.join(', ')} .
        }
        `;
        const classes = allChildNodes.map(node => node.targetClass);
        const headerBlock = `
        {
            VALUES (?columnIndex ?rowClass) {
                ${classes.map((c, index) => `(${index} <${c}>)`).join('\n')}
            }
            ?rowClass ^${shacl.targetNodePrefixed} ?meta .
             VALUES (?metaP ?tableP) {
                (${blueprint.colorIndexPrefixed} ${blueprint.colorIndexPrefixed})
                (${blueprint.faIconPrefixed} ${blueprint.faIconPrefixed})
                (${rdfs.labelPrefixed} ${blueprint.keyPrefixed})
            }
            ?meta  ?metaP ?metaO .
            BIND (IRI(CONCAT(STR(data:table), "/header", STR(?columnIndex))) AS ?header)
          }
        `;

        const allInstanceBlock = `
        {
            {
              SELECT ?instance ?class WHERE {
                VALUES ?class {
                    ${classes.map((c) => `<${c}>`).join('\n')}
                }
                ?instance a ?class .
              }
            }
            ?instance ${rdfs.labelPrefixed} ?label .
            ?class ^${shacl.targetNodePrefixed} ?meta .
            ?meta ${rdfs.labelPrefixed} ?key .
        }
        `;

        const tableBlock = `
        {
            {
              SELECT ${vars.join(' ')} WHERE {
                ${vars.map((variable, index) => {
            return `${variable} a <${classes[index]}> .\n${(index === 0) ? `` : `# var ${variable}\n ?var_${index - 1} ${allChildNodes[index].pathFromRoot} ${variable} .\n`}`;
        }).join('\n')}
              }
            }
            BIND (UUID() AS ?row)
        }
        `;

        return `${constructHead} WHERE { ${headerBlock} UNION ${allInstanceBlock} UNION ${tableBlock} }`;
    }

    // Breadth-first (BFS) traversal 
    private _collectAllChildNodes(root: HierarchyNode) {
        const queue = [root];
        const allChildNodes: HierarchyNode[] = [];
        while (queue.length > 0) {
            const node = queue.shift();
            if (node) {
                allChildNodes.push(node);
                queue.push(...node.children);
            }
        }
        return allChildNodes;
    }


    private _downStreamTeeQuery(typeIri: string, viewIri: string): string {

        const node = this._node.in(shacl.groupNamedNode).has(shacl.targetClassNamedNode, rdfEnvironment.namedNode(typeIri));

        if (node.values.length !== 1) {
            console.error(`Expected exactly one node for type ${typeIri}. Found ${node.values.length}.`);
            return '';
        }

        const hierarchNode = node.map(n => new HierarchyNode(n))[0];
        const pathToLeaves = this.pathsToLeaves(hierarchNode);

        const queriesForBranches: string[] = [];
        let maxIndex = 0;

        // iterate over all paths
        for (const path of pathToLeaves) {
            // iterate over all nodes in the path
            let query = '';
            path.forEach((node, index) => {
                maxIndex = Math.max(maxIndex, index);
                const subject = index > 0 ? `?var_${index}` : '?subject';
                const parentVar = index - 1 > 0 ? `?var_${index - 1}` : '?subject';

                query += index > 0 ? `${parentVar} ${node.pathFromRoot} ${subject}.\n` : '';
                query += `BIND(<${node.targetClass}> as ?class_${index})\n${subject} a ?class_${index} .\n`;
                query += `${subject} ${rdfs.labelPrefixed} ?label_${index} .\n`;
                query += `BIND (IRI(CONCAT(str(${subject}), '${viewIri}/viewContainer'))  AS ?child_${index})\n`;

            });
            queriesForBranches.push(query);
        }
        // create an array with numbers 0 to maxIndex
        const indices = Array.from(Array(maxIndex + 1).keys());

        const queryHead = `
    ${rdfs.sparqlPrefix()}
    ${shacl.sparqlPrefix()}
    ${nileaUi.sparqlPrefix()}
    ${blueprint.sparqlPrefix()}
    CONSTRUCT {
        <${viewIri}> a ${nileaUi.UiViewPrefixed} .
        <${viewIri}> ${nileaUi.forClassPrefixed} <${pathToLeaves[0][0].targetClass}> .
        <${viewIri}> ${nileaUi.hasViewContainerPrefixed}  <${viewIri}/viewContainer> .
        
        <${viewIri}/viewContainer> a  ${nileaUi.ViewContainerPrefixed} . 
        <${viewIri}/viewContainer> ${shacl.orderPrefixed} 1 .
        <${viewIri}/viewContainer> ${nileaUi.hasViewComponentPrefixed} ?componentIri .
        
        ?componentIri ${nileaUi.hasComponentDefinitionPrefixed} ${nileaUi.TreeViewComponentPrefixed} .
        ${nileaUi.TreeViewComponentPrefixed} ${rdfs.labelPrefixed} 'Tree'.
        ?componentIri a ${nileaUi.TreeViewComponentPrefixed} .
        ?componentIri  ${nileaUi.hasComponentDataPrefixed} ?componentDataIri .
        ?componentDataIri ${blueprint.hasRootPrefixed} ?child_0 .
      ${indices.map(i => {
            return `${i === 0 ? `?child_0 a ${blueprint.TreeRootPrefixed} .\n` : ''} 
       ?${i === 0 ? `child_0 ${blueprint.instancePrefixed} ?subject` : `child_${i} ${blueprint.instancePrefixed} ?var_${i}`}.\n

      ?${i === 0 ? 'subject' : `var_${i}`} ${rdfs.labelPrefixed} ?label_${i} .\n
      ?${i === 0 ? 'subject' : `var_${i}`}  a ?class_${i} .\n
      ?child_${i}  ${blueprint.childPrefixed} ?child_${i + 1}.\n`;

        }).join('\n')}
     
    }
    `;

        const queryBody = `
    WHERE {
      {
        ${queriesForBranches.join('} UNION {')}
      }
    }
    `;

        return queryHead + queryBody;
    }

    private pathsToLeaves(node: HierarchyNode, path: HierarchyNode[] = []): HierarchyNode[][] {
        // Add the current node to the path
        path = [...path, node];

        // If the node is a leaf, return the path to it
        if (node.children.length === 0) {
            return [path];
        }

        // If the node is not a leaf, recursively find paths for all children
        let paths: HierarchyNode[][] = [];
        for (const child of node.children) {
            paths = [...paths, ...this.pathsToLeaves(child, path)];
        }

        return paths;
    }



}


export interface ContentItem {
    label: string;
    iri: string;
    avatar: Avatar;
}