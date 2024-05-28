import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bp-configuration-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './configuration-card.component.html',
  styleUrl: './configuration-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationCardComponent {
  firstLine = input.required<string>();
  secondLine = input<string>();
  icon = input<string>('fa fa-cog');
}
