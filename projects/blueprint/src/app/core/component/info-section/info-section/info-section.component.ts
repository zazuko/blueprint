import { Component, ChangeDetectionStrategy, Input, input } from '@angular/core';

@Component({
  selector: 'bp-info-section',
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class InfoSectionComponent {
  public readonly icon = input('');
  public readonly heading = input('');
  public readonly tooltip = input('');
  public readonly expandable = input(false);

}
