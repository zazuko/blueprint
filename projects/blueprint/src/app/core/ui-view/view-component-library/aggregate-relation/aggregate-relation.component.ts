import {
  Component,
  output,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { INodeElement } from '@blueprint/model/node-element/node-element.class';

import { AvatarComponent } from 'projects/blueprint/src/app/shared/component/ui/avatar/avatar.component';
import { CompositionNodeElement } from '@blueprint/service/graph/aggregate/model/composition-link-result/composition-result';
import { NgStyle } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'bp-aggregate-relation',
  templateUrl: './aggregate-relation.component.html',
  styleUrl: './aggregate-relation.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AvatarComponent, NgStyle, MatTooltipModule],
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
