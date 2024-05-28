import { Component, input } from '@angular/core';
import { Avatar, AvatarComponent } from '@blueprint/component/avatar/avatar.component';

@Component({
  selector: 'bp-hierarchy-card',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './hierarchy-card.component.html',
  styleUrl: './hierarchy-card.component.scss'
})
export class HierarchyCardComponent {
  firstLine = input.required<string>();
  secondLine = input<string>('');
  avatars = input.required<Avatar[]>();
}
