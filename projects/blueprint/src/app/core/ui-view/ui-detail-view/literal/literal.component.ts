import { Component, input } from '@angular/core';
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

export enum LiteralRenderType {
  PLAIN = 'https://ld.flux.zazuko.com/shapes/metadata/Plain',
  HIDDEN = 'https://ld.flux.zazuko.com/shapes/metadata/Hidden',
  UNKNOWN = 'https://ld.flux.zazuko.com/shapes/metadata/Unknown',

}
export interface UILiteral {
  ruleIri: string,
  label: string,
  value: RdfTypes.Literal[]
  renderer: LiteralRenderType
  order: number
  //lineage: LiteralLineage
}
