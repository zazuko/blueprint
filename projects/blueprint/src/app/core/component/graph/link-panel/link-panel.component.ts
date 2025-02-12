import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { MultiLinkLabels } from '../graph-elements/model/multi-link-labels.model';

@Component({
    selector: 'bp-link-panel',
    templateUrl: './link-panel.component.html',
    styleUrls: ['./link-panel.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule]
})
export class LinkPanelComponent {
  @Input() links: MultiLinkLabels;

}
