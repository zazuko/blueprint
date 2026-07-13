import {
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
@Component({
  selector: 'bp-avatar',
  imports: [],
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  avatars = input.required<Avatar[]>();
  size = input<'normal' | 'large' | 'xlarge'>('xlarge');
  shape = input<'square' | 'circle'>('circle');
  selected = input<boolean>(false);

  uniqueAvatars = computed<AvatarWithId[]>(() => {
    const unique = new Map<string, AvatarWithId>();
    this.avatars().forEach((avatar) => {
      const avatarKey = `${avatar.label}-${avatar.icon}-${avatar.color}`;
      if (!unique.has(avatarKey)) {
        unique.set(avatarKey, { ...avatar, id: avatarKey });
      }
    });
    return Array.from(unique.values());
  });
}

export interface Avatar {
  label: string;
  icon: string;
  color: string;
}

interface AvatarWithId extends Avatar {
  id: string;
}
