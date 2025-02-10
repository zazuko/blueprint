import { Component, computed, input } from '@angular/core';
import { BaseUiWidget } from '../base-ui-widget.class';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';

import { blueprint } from '@blueprint/ontology';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';
import { GraphPointer } from 'clownface';
import { Avatar, AvatarComponent } from '@blueprint/component/avatar/avatar.component';

@Component({
  selector: 'bp-count-widget',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './count-widget.component.html',
  styleUrl: './count-widget.component.scss'
})
export class CountWidgetComponent implements BaseUiWidget<GraphPointer | Counter> {
  data = input.required<GraphPointer | Counter>();

  computedData = computed<Counter>(() => {
    const data = this.data();

    if (Array.isArray((data as GraphPointer).values)) {
      return new RdfCounter(data as GraphPointer);
    }

    return data as Counter;

  });

  label = computed<string>(() => {
    return this.computedData().avatars.map(a => a.label + (this.computedData().count > 1 ? 's' : '')).join(', ');
  });

}


interface Counter {
  count: number;
  avatars: Avatar[];
}

class RdfCounter extends ClownfaceObject implements Counter {
  #avatars: Avatar[] | undefined;
  #count: number | undefined;

  constructor(node: GraphPointer) {
    super(node);
  }

  get count(): number {
    if (this.#count === undefined) {
      const countString = this._node.out(blueprint.countNamedNode).values[0];
      if (countString === undefined) {
        this.#count = -1;
      } else {
        const c = Number(countString);
        if (isNaN(c)) {
          this.#count = -1;
        } else {
          this.#count = c;
        }
      }
    }
    return this.#count;
  }

  get avatars(): Avatar[] {
    if (this.#avatars === undefined) {
      const nodeElement = new NodeElement(this._node);
      this.#avatars = nodeElement.avatars
    }
    return this.#avatars;
  }

}