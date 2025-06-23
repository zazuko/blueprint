import { Component, input, output, signal } from '@angular/core';
import { BidiractionalRelation, IncomingRelation, OutgoingRelation, RdfNodeRelation } from '../model/node-relation';
import { BadgeModule } from 'primeng/badge';
import { RdfPrefixPipe } from "../../../rdf/prefix/rdf-prefix.pipe";
import { ExploredResource } from 'projects/blueprint/src/app/features/explore/model/explored-resource.class';
import { RelationDetailComponent } from '../relation-detail/relation-detail.component';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';

@Component({
  selector: 'bp-relation',
  imports: [BadgeModule, RdfPrefixPipe, RelationDetailComponent],
  templateUrl: './relation.component.html',
  styleUrl: './relation.component.scss',

})
export class RelationComponent {
  relation = input.required<RdfNodeRelation>();
  exploredResource = input.required<ExploredResource>();
  showAsRdf = input<boolean>(true);

  nodeSelected = output<NodeElement>();

  showRelationDetails = signal<boolean>(false);


  castToBidiractionalRelation(relation: RdfNodeRelation): BidiractionalRelation {
    return relation as BidiractionalRelation;
  }

  castToOutgoingRelation(relation: RdfNodeRelation): OutgoingRelation {
    return relation as OutgoingRelation;
  }

  castToIncomingRelation(relation: RdfNodeRelation): IncomingRelation {
    return relation as IncomingRelation;
  }

  toggleShowDetails(): void {
    this.showRelationDetails.set(!this.showRelationDetails());
  }

  emitNodeSelected(node: NodeElement): void {
    this.nodeSelected.emit(node);
  }

}
