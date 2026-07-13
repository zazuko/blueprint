import {
  Component,
  output,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AvatarComponent } from '../../../../shared/component/ui/avatar/avatar.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'bp-hierarchy',
  imports: [AvatarComponent, MatTooltipModule],
  templateUrl: './hierarchy.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hierarchy.component.scss',
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
  classIri: string;
  label: string;
  classLabel: string;
  icon: string;
  color: string;
}
