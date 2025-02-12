import { Component, input } from '@angular/core';
import { LiteralRenderType } from '../../../service/ui-config/ui-detail/model/ui-detail-configuration-element';

@Component({
    selector: 'bp-literal-view',
    imports: [],
    templateUrl: './literal-view.component.html',
    styleUrl: './literal-view.component.scss'
})
export class LiteralViewComponent {
  label = input<string>('');
  value = input<string>('');
  renderLiteralAs = input<LiteralRenderType>(LiteralRenderType.PLAIN);

  LiteralViewType = LiteralRenderType;
}
