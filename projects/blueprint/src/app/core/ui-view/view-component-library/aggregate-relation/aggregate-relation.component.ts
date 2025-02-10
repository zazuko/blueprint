import { Component, output, input } from '@angular/core';
import { INodeElement } from '@blueprint/model/node-element/node-element.class';

import { AvatarComponent } from '@blueprint/component/avatar/avatar.component';
import { CompositionNodeElement } from '@blueprint/service/graph/aggregate/model/composition-link-result/composition-result';
import { NgStyle } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';


@Component({
    selector: 'bp-aggregate-relation',
    templateUrl: './aggregate-relation.component.html',
    styleUrl: './aggregate-relation.component.scss',
    imports: [AvatarComponent, NgStyle, TooltipModule]
})
export class AggregateRelationComponent {
  relation = input.required<CompositionNodeElement[]>();
  subject = input.required<INodeElement>();
  label = input.required<string>();


  public connectionPoints: INodeElement[] = [];

  nodeSelected = output<string>();

  emitNodeSelected(iri: string, event: Event) {
    event.stopPropagation();
    this.nodeSelected.emit(iri);
  }
}

