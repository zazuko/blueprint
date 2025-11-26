import { Component, input } from '@angular/core';
import { Avatar, AvatarComponent } from 'projects/blueprint/src/app/shared/component/ui/avatar/avatar.component';

@Component({
  selector: 'bp-hierarchy-card',
  imports: [AvatarComponent],
  templateUrl: './hierarchy-card.component.html',
  styleUrl: './hierarchy-card.component.scss'
})
export class HierarchyCardComponent {
  readonly firstLine = input.required<string>();
  readonly secondLine = input<string>('');
  readonly avatars = input.required<Avatar[]>();
}
