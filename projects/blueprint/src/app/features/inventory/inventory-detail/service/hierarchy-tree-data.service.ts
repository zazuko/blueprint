import { Injectable, inject } from '@angular/core';

import { Observable, map, switchMap } from 'rxjs';

import { TreeNode } from 'primeng/api';

import rdfEnvironment from '@zazuko/env';

import { HierarchyService } from '../../../configuration/topology/service/hierarchy.service';
import { HierarchyNode } from '../../../configuration/topology/service/model/hierarchy-node.model';

import { GraphPointer } from 'clownface';

import { NodeElement } from '@blueprint/model/node-element/node-element.class';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { blueprint, rdf, rdfs } from '@blueprint/ontology';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { labelAlphaSort, sparqlUtils } from '@blueprint/utils';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';

@Injectable({
  providedIn: 'root'
})
export class HierarchyTreeDataService {
  readonly #hierarchyService = inject(HierarchyService);
  readonly #sparqlService = inject(SparqlService);
  readonly #uiClassMetadataService = inject(UiClassMetadataService);


  /**
   * 
   * @param iri the iri of the hierarchy
   * @returns an Observable of the tree nodes
   */
  getTreeDataForHierarchy(iri: string): Observable<TreeNode<NodeElement>[]> {

    return this.#hierarchyService.getHierarchyDefinitionByIri(iri).pipe(
      switchMap(hierarchy => {
        debugger;
        const query = this.getQueryFor(hierarchy.rootNode);
        console.log(query);
        const metadataQuery = this.#uiClassMetadataService.getClassMetadataSparqlQuery();
        return this.#sparqlService.construct(sparqlUtils.mergeConstruct([query, metadataQuery]));

      }),
      map(dataset => {
        const graph = rdfEnvironment.clownface({ dataset });
        const treeNodes = graph.has(rdf.typeNamedNode, blueprint.TreeNodeNamedNode).map(x => new CfTreeNode(x));
        const parents = treeNodes.filter(node => node.parent.length === 0);
        const tree = parents.map(parent => graph.namedNode(parent.iri)).map(node => this._buildTree(node));
        return tree;
      }));
  }

  private _buildTree(node: GraphPointer): TreeNode<NodeElement> {
    const data = new NodeElement(node);
    const treeNode: TreeNode = {
      key: data.iri,
      label: data.label,
      data,
      children: []
    };

    const cfChild = node.out(blueprint.childNamedNode);

    cfChild.forEach(child => {
      treeNode.children.push(this._buildTree(child));
    });

    treeNode.children = treeNode.children.sort(labelAlphaSort);

    return treeNode;
  }

  private getQueryFor(rootNode: HierarchyNode): string {
    const pathToLeaves = this._pathsToLeaves(rootNode);

    // iterate over all nodes in the path
    const rdfClassesSet = new Set<string>();
    pathToLeaves.forEach(hierarchyPath => hierarchyPath.forEach(node => rdfClassesSet.add(node.targetClass)));
    const rdfClasses = Array.from(rdfClassesSet);


    const classesQuery = rdfClasses.map((rdfClass, index) => {
      return `
    BIND(<${rdfClass}> as ?class_${index})\n
    ?var_${index} a ?class_${index} .\n
    ?var_${index} rdfs:label ?label_${index} .\n`;
    });

    const queriesForBranches: string[] = pathToLeaves.flatMap(hierarchyNodePath => {
      const q = hierarchyNodePath.flatMap((hierarchyNode, index) => {


        const parent = hierarchyNode.parent;
        if (!parent) {
          return [];
        }
        // relations between nodes
        const parentClass = parent.targetClass;
        const childClass = hierarchyNode.targetClass;
        const parentPredicate = hierarchyNode.pathToParent;
        const query = `
          ?parent_${index} a <${parentClass}> .
          ?child_${index} a <${childClass}> .

          ?child_${index} ${parentPredicate} ?parent_${index}  .\n
        `;

        return [query];
      });
      return q;
    });


    const queryHead = `
    ${rdfs.sparqlPrefix()}
    ${blueprint.sparqlPrefix()}
    
    CONSTRUCT {
      ${rdfClasses.map((_rdfClass, index) => {

      return `${index === 0 ? `?var_${index} a ${blueprint.TreeRootPrefixed} .\n` : ''}
      ?var_${index} a ${blueprint.TreeNodePrefixed} .\n
      ?var_${index} a ?class_${index} .\n
      ?var_${index} rdfs:label ?label_${index} .\n`
    }).join('\n')}
  
      ${queriesForBranches.map((_q, index) => {
      return `
      ?child_${index + 1} a ${blueprint.ChildPrefixed}.\n
      ?parent_${index + 1} ${blueprint.childPrefixed} ?child_${index + 1}.\n`;

    }).join('\n')}
     
    }
    `;

    const queryBody = `
    WHERE {
      {
        ${classesQuery.join('} UNION {')}
      }
      UNION
      {
        ${queriesForBranches.join('} UNION {')}

      }
    }
    `;

    return queryHead + queryBody;
  }

  private _pathsToLeaves(node: HierarchyNode, path: HierarchyNode[] = []): HierarchyNode[][] {
    // Add the current node to the path
    path = [...path, node];

    // If the node is a leaf, return the path to it
    if (node.children.length === 0) {
      return [path];
    }

    // If the node is not a leaf, recursively find paths for all children
    let paths: HierarchyNode[][] = [];
    for (const child of node.children) {
      paths = [...paths, ...this._pathsToLeaves(child, path)];
    }

    return paths;
  }


}



class CfTreeNode extends ClownfaceObject {
  private _children: CfTreeNode[] | undefined = undefined;
  private _parent: CfTreeNode[] | undefined = undefined;
  private _label: string | undefined = undefined;
  constructor(node: GraphPointer) {
    super(node);
  }

  get children(): CfTreeNode[] {
    if (this._children === undefined) {
      this._children = this._node.out(blueprint.childNamedNode).map(child => new CfTreeNode(child));
    }
    return this._children;
  }

  get parent(): CfTreeNode[] {
    if (this._parent === undefined) {
      this._parent = this._node.in(blueprint.childNamedNode).map(parent => new CfTreeNode(parent));
    }
    return this._parent;
  }

  get label(): string {
    if (this._label === undefined) {
      this._label = this._node.out(rdfs.labelNamedNode).values.join(', ');
      if (this._label === '') {
        this._label = 'no label';
      }
    }
    return this._label;
  }

}