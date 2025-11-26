import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardModule } from 'primeng/card';

@Component({
  selector: 'bp-configuration-card',
  imports: [NgClass, CardModule],
  templateUrl: './configuration-card.component.html',
  styleUrl: './configuration-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationCardComponent {
  readonly firstLine = input.required<string>();
  readonly secondLine = input<string>();
  readonly icon = input<string>('fa fa-cog');
}
