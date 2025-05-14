import { PanelModule } from 'primeng/panel';

import { Component, computed, input } from '@angular/core';
import { LiteralRenderType } from '../../../service/ui-config/ui-detail/model/ui-detail-configuration-element';
import { RdfTypes } from '../../../rdf/rdf-environment';

@Component({
  selector: 'bp-literal-view',
  imports: [PanelModule],
  templateUrl: './literal-view.component.html',
  styleUrl: './literal-view.component.scss'
})
export class LiteralViewComponent {
  label = input.required<string>();
  value = input.required<RdfTypes.Literal[]>();
  renderLiteralAs = input<LiteralRenderType>(LiteralRenderType.PLAIN);

  LiteralViewType = LiteralRenderType;

  transformedLabel = computed<string>(() => {
    const label = this.label();
    const transformedLabel = label.charAt(0).toUpperCase() + label.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2');
    return transformedLabel;
  });
}
