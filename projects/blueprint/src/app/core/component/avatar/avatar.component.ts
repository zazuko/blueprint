import { Component, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'bp-avatar',
  standalone: true,
  imports: [AvatarModule, AvatarGroupModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  avatars = input.required<Avatar[]>();
  size = input<'normal' | 'large' | 'xlarge'>('xlarge');
  shape = input<'square' | 'circle'>('circle');

}


export interface Avatar {
  label: string;
  icon: string;
  color: string;
  classIri: string;
}
