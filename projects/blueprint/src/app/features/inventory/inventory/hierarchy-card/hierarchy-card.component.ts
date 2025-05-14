import { Component, input } from '@angular/core';
import { Avatar, AvatarComponent } from 'projects/blueprint/src/app/shared/component/avatar/avatar.component';

@Component({
  selector: 'bp-hierarchy-card',
  imports: [AvatarComponent],
  templateUrl: './hierarchy-card.component.html',
  styleUrl: './hierarchy-card.component.scss'
})
export class HierarchyCardComponent {
  firstLine = input.required<string>();
  secondLine = input<string>('');
  avatars = input.required<Avatar[]>();
}
