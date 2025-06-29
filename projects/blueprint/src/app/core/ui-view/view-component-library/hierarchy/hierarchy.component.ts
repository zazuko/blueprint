import { Component, output, input } from '@angular/core';
import { AvatarComponent } from '../../../../shared/component/ui/avatar/avatar.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'bp-hierarchy',
  imports: [AvatarComponent, TooltipModule],
  templateUrl: './hierarchy.component.html',
  styleUrl: './hierarchy.component.scss'
})
export class HierarchyComponent {
  readonly hierarchy = input<HierarchyElement[]>([]);
  readonly label = input<string>('');
  nodeSelected = output<string>();

  emitNodeSelected(iri: string) {
    this.nodeSelected.emit(iri);
  }

}

export interface HierarchyElement {
  iri: string;
  classIri: string,
  label: string;
  classLabel: string;
  icon: string;
  color: string;
}