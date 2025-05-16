import { Component, effect, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'bp-avatar',
  imports: [AvatarModule, AvatarGroupModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  avatars = input.required<Avatar[]>();
  size = input<'normal' | 'large' | 'xlarge'>('xlarge');
  shape = input<'square' | 'circle'>('circle');

  constructor() {
    effect(() => {
      console.log('asdfadfasfad', this.avatars());
    }
    );
  }
}

export interface Avatar {
  label: string;
  icon: string;
  color: string;
}
