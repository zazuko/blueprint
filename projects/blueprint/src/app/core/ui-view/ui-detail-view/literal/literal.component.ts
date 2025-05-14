import { Component, input } from '@angular/core';
import { LiteralRenderType } from '@blueprint/service/ui-config/ui-detail/model/ui-detail-configuration-element';
import { StringLiteralComponent } from '../component/string-literal/string-literal.component';
import { RdfTypes } from '../../../rdf/rdf-environment';

/** 
 * 
*/
@Component({
  selector: 'bp-literal',
  imports: [
    StringLiteralComponent
  ],
  templateUrl: './literal.component.html',
  styleUrls: ['./literal.component.scss', './../shared-literal-style.scss']
})
export class LiteralComponent {
  literal = input.required<UILiteral>();
  LiteralRenderType = LiteralRenderType;
}


export interface UILiteral {
  label: string,
  value: RdfTypes.Literal[]
  renderer: LiteralRenderType
  order: number
  //lineage: LiteralLineage
}


export interface LiteralLineage {
  sourceIri: string,
  label: string,
  path: string,
  ruleIri: string,
  ruleType: LiteralRuleType
}

enum LiteralRuleType {
  SYNTHETIC,
  MANUAL_CONFIGURATION,
}
