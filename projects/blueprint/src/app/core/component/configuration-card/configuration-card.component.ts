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
  firstLine = input.required<string>();
  secondLine = input<string>();
  icon = input<string>('fa fa-cog');
}
