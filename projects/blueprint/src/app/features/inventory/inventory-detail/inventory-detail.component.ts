import { Component, DestroyRef, Input, OnChanges, SimpleChanges, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TreeNode } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree';
import { InputTextModule } from 'primeng/inputtext';

import { BreadcrumbPageComponent } from "../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { GroupTableComponent } from "../../../dev/group-table/group-table.component";
import { ClusterDiagramComponent } from "../../../dev/cluster-diagram/cluster-diagram.component";
import { HierarchyTreeDataService } from './service/hierarchy-tree-data.service';
import { NodeElement } from '../../../core/model/node-element/node-element.class';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HierarchyService } from '../../configuration/topology/service/hierarchy.service';
import { MessageChannelService } from '../../../core/service/message-channel/message-channel.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AvatarComponent } from '@blueprint/component/avatar/avatar.component';
import { fadeInOut } from '@blueprint/animation/index';
import { ContentItem, HierarchyDefinition } from '../../configuration/topology/service/model/hierarchy-definition.model';
import { labelAlphaSort } from '../../../core/utils/sort-functions';

@Component({
    templateUrl: './inventory-detail.component.html',
    styleUrl: './inventory-detail.component.scss',
    imports: [
        BreadcrumbPageComponent,
        AvatarComponent,
        FormsModule,
        NgClass,
        GroupTableComponent,
        ClusterDiagramComponent,
        ToolbarModule,
        SelectButtonModule,
        TreeModule,
        InputTextModule,
    ],
    animations: [fadeInOut]
})
export class InventoryDetailComponent implements OnChanges {
  @Input({ required: true }) public id: string | null = null;

  readonly #destroyRef = inject(DestroyRef);
  readonly #router = inject(Router);
  readonly #loadingIndicatorService = inject(LoadingIndicatorService);
  readonly #hierarchyTreeDataService = inject(HierarchyTreeDataService);
  readonly #hierarchyService = inject(HierarchyService);
  readonly #messageChannel = inject(MessageChannelService);

  hierarchyDefinitionSignal = signal<HierarchyDefinition | null | undefined>(undefined);
  labelSignal = computed<string>(() => this.hierarchyDefinitionSignal()?.label ?? '');
  commentSignal = computed<string>(() => this.hierarchyDefinitionSignal()?.description ?? '');

  stateOptions: SelectButtonState[] = [{ label: 'Tree', value: 'tree' }, { label: 'Cluster', value: 'cluster' }];

  readonly stateSignal = signal<string>('tree');
  state = 'tree';

  filterTerm = signal<string>('');
  filterTermSubject = new Subject<string>();

  filteredData = computed<TreeNode<NodeElement>[]>(() => {
    const filterTerm = this.filterTerm();
    const treeData = this.dataSignal();
    if (filterTerm.length === 0) {
      // collapse all nodes
      this._collapseAll(treeData);
      return treeData;
    }

    const filterTermLower = filterTerm.toLowerCase();
    return this._filterNodes(treeData, filterTermLower);

  });


  dataSignal = signal<TreeNode<NodeElement>[] | null>(null);

  classesSignal = computed<ContentItem[]>(() => {
    const definition = this.hierarchyDefinitionSignal();
    if (!definition) {
      console.error('No definition');
      return [];
    }
    return definition.contentList
  })
  readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Inventory',
      route: '../..',
      disabled: false
    }, {
      label: 'Detail',
      route: '.',
      disabled: false
    }
  ];

  private _countNodes(nodes: TreeNode<NodeElement>[], label: string): number {
    let count = 0;
    nodes.forEach(node => {
      if (node.data.classLabel.includes(label)) {
        count++;
      }
      if (node.children) {
        count += this._countNodes(node.children, label);
      }
    });
    return count;
  }

  constructor() {
    this.filterTermSubject.pipe(
      takeUntilDestroyed(this.#destroyRef),
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filterTerm.set(term);

    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const id = changes['id']?.currentValue ?? null;
    if (id) {
      this.#hierarchyService.getHierarchyByIri(id).pipe(
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe({
        next: hierarchy => {
          this.hierarchyDefinitionSignal.set(hierarchy);
        },
        error: error => {
          this.#messageChannel.error(`Error loading Hierarchy ${id}`, error);
        }
      });

      this.#loadingIndicatorService.loading();
      this.#hierarchyTreeDataService.getTreeDataForHierarchy(id).pipe(
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe(
        {
          next: x => {
            this.#loadingIndicatorService.done();
            this.dataSignal.set(x.sort(labelAlphaSort));
          },
          error: error => {
            this.#loadingIndicatorService.done();
            console.error(`Error loading table for Hierarchy ${id}`, error);
          },
          complete: () => {
            this.#loadingIndicatorService.done();
          }
        });

    }
  }

  nodeSelected(iri: string) {
    this.#router.navigate(['explore', iri]);
  }

  treeNodeSelected(treeNode: TreeNodeSelectEvent) {
    this.#router.navigate(['explore', treeNode.node.data.iri]);
  }

  onStateChanged(state: string) {
    console.log('event', state);
  }


  onFilterInputChanged(filterTerm: string) {
    this.filterTermSubject.next(filterTerm);
  }


  // tree filter methods 
  private _filterNodes(nodes: TreeNode<NodeElement>[], filterTerm: string): TreeNode<NodeElement>[] {
    const filteredNodes: TreeNode<NodeElement>[] = [];
    nodes.forEach(node => {
      const childNodes = node.children ? this._filterNodes(node.children, filterTerm) : [];
      if (node.label.toLowerCase().includes(filterTerm) || childNodes.length > 0) {
        // set the nodes to be shown
        node.expanded = true;
        filteredNodes.push({ ...node, children: childNodes });
      } else {
        // hide the node
        node.expanded = false;
      }
    });
    return filteredNodes;
  }

  private _collapseAll(nodes: TreeNode<NodeElement>[]) {
    nodes.forEach(node => {
      node.expanded = false;
      if (node.children) {
        this._collapseAll(node.children);
      }
    });
  }
}

interface SelectButtonState {
  label: string;
  value: string;
} 
