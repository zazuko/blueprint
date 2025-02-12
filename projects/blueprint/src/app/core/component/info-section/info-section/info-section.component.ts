import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'bp-info-section',
    templateUrl: './info-section.component.html',
    styleUrls: ['./info-section.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class InfoSectionComponent {
  @Input() public icon = '';
  @Input() public heading = '';
  @Input() public tooltip = '';
  @Input() public expandable = false;

}
