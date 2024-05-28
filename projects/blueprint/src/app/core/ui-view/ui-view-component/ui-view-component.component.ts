import { Component, ChangeDetectionStrategy, inject, output, DestroyRef, effect, input, viewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiViewComponent } from '../model/ui-view.model';
import { ArchiDiagramComponent } from '../view-component-library/archi-diagram/archi-diagram.component';
import {
  TreeViewComponent
} from '../view-component-library/tree-view/tree-view.component';
import { DatabaseTableComponent } from '../view-component-library/database-table/database-table/database-table.component';

import { DatabaseColumn, DatabaseTable } from '../view-component-library/database-table/model/database.model';


import { TreeNode } from 'primeng/api';
import { NodeElement } from '../../model/node-element/node-element.class';
import { GraphPointer } from 'clownface';
import { nileaUi, rdfs, blueprint } from '@blueprint/ontology';
import { MessageChannelService } from '../../service/message-channel/message-channel.service';
import { DashHostDirective } from './dash-host/dash-host.directive';
import { ArchimateApplication, ArchimateDataFlow } from '../view-component-library/archi-diagram/model/archimate-data-flow';
import { archimateDiagramOntology } from '../view-component-library/archi-diagram/model/ontology';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { labelAlphaSort } from '../../utils/sort-functions';
@Component({
  selector: 'bp-ui-view-component',
  standalone: true,
  imports: [CommonModule, DashHostDirective],
  templateUrl: './ui-view-component.component.html',
  styleUrls: ['./ui-view-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiViewComponentComponent {
  readonly uiViewComponent = input.required<UiViewComponent>();
  readonly nodeSelected = output<string>();

  dashHost = viewChild<DashHostDirective>(DashHostDirective);

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageChannel = inject(MessageChannelService);

  constructor() {

    effect(() => {
      const uiViewComponent = this.uiViewComponent();
      const viewContainerRef = this.dashHost().viewContainerRef;

      if (!uiViewComponent || !viewContainerRef) {
        return;
      }
      viewContainerRef.clear();
      const componentKind = uiViewComponent.componentDefinition.iri;

      switch (componentKind) {
        case `${nileaUi.namespace[''].value}ApplicationArchimateContextDiagramDefinition`:
          this._setupArchimateDiagram(viewContainerRef, uiViewComponent);
          break;
        case `${nileaUi.namespace[''].value}SqlDatabseTableDefinition`:
          this._setupDatabaseTable(viewContainerRef, uiViewComponent);
          break;
        case `${nileaUi.namespace[''].value}TreeViewComponent`:
          this._setupTreeView(viewContainerRef, uiViewComponent);
          break;
        default:
          this._messageChannel.error(`No component found for ${uiViewComponent.componentDefinition.iri}`);
      }

    }
    )
  }

  private _buildTree(node: GraphPointer): TreeNode<NodeElement> {
    const data = new NodeElement(node.out(blueprint.instanceNamedNode) as GraphPointer);
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


  private _setupArchimateDiagram(viewContainerRef: ViewContainerRef, uiViewComponent: UiViewComponent) {

    const componentRef =
      viewContainerRef.createComponent(ArchiDiagramComponent);

    // convert result graph to component input
    // source input
    const incomingFlows: ArchimateDataFlow[] = uiViewComponent.componentData.out(nileaUi.hasCenterNamedNode).in(archimateDiagramOntology.target).map(inFlowNode => new ArchimateDataFlow(inFlowNode)).sort((a, b) => a.source?.label.localeCompare(b.source?.label));

    componentRef.setInput('incomingFlows', incomingFlows);

    // center input 
    const center: ArchimateApplication[] = uiViewComponent.componentData.out(nileaUi.hasCenterNamedNode).map(appNode => new ArchimateApplication(appNode));
    componentRef.setInput('center', center);

    // destination input
    const outgoingFlows: ArchimateDataFlow[] = uiViewComponent.componentData.out(nileaUi.hasCenterNamedNode).in(archimateDiagramOntology.source).map(outFlowNode => new ArchimateDataFlow(outFlowNode)).sort((a, b) => a.target?.label.localeCompare(b.target?.label));

    // if an element is in the sources and destinations array, move it to the same index as in the sources array.
    // to have it on the same level in the diagram.
    // Step 1: Find intersection
    const sourceApplications = incomingFlows.map(flow => flow.source);
    const destinationApplications = outgoingFlows.map(flow => flow.target);

    const intersectionApplications = sourceApplications.filter(sourceApplications =>
      destinationApplications.some(destinationApp => destinationApp.iri === sourceApplications.iri)
    );

    // find the index of the intersection elements in the sources and move the intersection elements in the destinations to the same index.
    intersectionApplications.forEach(application => {
      const sourceIndex = incomingFlows.findIndex(source => source.source.iri === application.iri);
      const destinationIndex = outgoingFlows.findIndex(destination => destination.target.iri === application.iri);
      if (sourceIndex !== destinationIndex) {
        const destinationElement = outgoingFlows.splice(destinationIndex, 1)[0];
        outgoingFlows.splice(sourceIndex, 0, destinationElement);
      }
    });

    componentRef.setInput('outgoingFlows', outgoingFlows);

    // connect outputs
    // connect selectedNode input and bubble up selectedNode output
    outputToObservable(componentRef.instance.nodeSelected).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(iri => {
      this.nodeSelected.emit(iri);
    });

  }

  private _setupDatabaseTable(viewContainerRef: ViewContainerRef, uiViewComponent: UiViewComponent) {
    const componentRef = viewContainerRef.createComponent(DatabaseTableComponent);

    // convert result graph to component input
    // crete columns
    const columns: DatabaseColumn[] = uiViewComponent.componentData.out(nileaUi.columnNamedNode).map(column => {
      return {
        iri: column.value,
        label: column.out(rdfs.labelNamedNode).value,
        type: column.out(nileaUi.dataTypeNamedNode).value,
        settings: column.out(nileaUi.hasSettingsNamedNode).map(setting => {
          return {
            label: setting.out(rdfs.labelNamedNode).value,
            isKey: setting.out(nileaUi.isKeyNamedNode).value === 'true',
            isPrimaryKey: setting.out(nileaUi.isPrimaryKeyNamedNode).value === 'true',
          };
        }),
        references: column.out(nileaUi.referencesNamedNode).map(reference => {
          return {
            isIncoming: reference.out(nileaUi.isInboundNamedNode).value === 'true',
            tableIri: reference.out(nileaUi.tableNamedNode).value,
            table: reference.out(nileaUi.tableNamedNode).out(rdfs.labelNamedNode).value,
            column: reference.out(nileaUi.columnNamedNode).out(rdfs.labelNamedNode).value
          };
        })
      } as DatabaseColumn;
    }
    );

    // create table input and attach columns
    const table: DatabaseTable = {
      iri: uiViewComponent.componentData.value,
      label: uiViewComponent.componentData.out(rdfs.labelNamedNode).value,
      columns
    }

    // set database table as input
    componentRef.setInput('table', table);

    // connect outputs
    // connect selectedNode input and bubble up selectedNode output
    // this are the column refs (FKs)
    outputToObservable(componentRef.instance.nodeSelected).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(iri => {
      this.nodeSelected.emit(iri);
    });
  }

  private _setupTreeView(viewContainerRef: ViewContainerRef, uiViewComponent: UiViewComponent) {

    const componentRef = viewContainerRef.createComponent(TreeViewComponent);

    // convert result graph to component input
    const cfTree = uiViewComponent.componentData.out(blueprint.hasRootNamedNode);
    const tree = cfTree.map(dataNode => this._buildTree(dataNode)).sort(labelAlphaSort);
    componentRef.setInput('data', tree);

    // connect outputs
    // connect selectedNode input and bubble up selectedNode output
    outputToObservable(componentRef.instance.nodeSelected).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(iri => {
      this.nodeSelected.emit(iri);
    });
  }
}
