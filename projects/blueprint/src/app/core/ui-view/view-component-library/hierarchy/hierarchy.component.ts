import { NgClass, NgStyle } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { AvatarComponent } from '../../../component/avatar/avatar.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'bp-hierarchy',
  standalone: true,
  imports: [NgClass, NgStyle, AvatarComponent, TooltipModule],
  templateUrl: './hierarchy.component.html',
  styleUrl: './hierarchy.component.scss'
})
export class HierarchyComponent {
  @Input() hierarchy: HierarchyElement[] = [];
  @Input() label: string = '';
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