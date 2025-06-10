import { Component, computed, effect, input, output } from '@angular/core';
import { Graph, IUiGraphNode, IUiLink, RdfUiLink } from '../graph/model/graph.model';
import { ExploredResource } from '../../../features/explore/model/explored-resource.class';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';

@Component({
  selector: 'bp-node-relations',
  imports: [],
  templateUrl: './node-relations.component.html',
  styleUrl: './node-relations.component.scss'
})
export class NodeRelationsComponent {
  readonly graph = input.required<Graph>();
  readonly exploredResource = input.required<ExploredResource>();

  nodeSelected = output<IUiGraphNode>();

  relations = computed<any[]>(() => {
    // totdo: implement relations logic
    // the graph service is providing links and nodes but it's too compicated to handle it here
    // think about providing another data structure for this. 

    return [];
  });


  constructor() {
    effect(() => {
      const g = this.relations();
      console.log('relations changed', g);
    });

  }
}

interface IUiLinkWithDirection extends RdfUiLink {
  direction: 'forward' | 'backward' | 'both';
}

interface NodeRelation {
  domain: string[],
  range: string[],
  link: IUiLink[],
  domainIncludes: string[],
  rangeIncludes: string[],
  linkLabel: string,
  linkPath: string,
  direction: 'forward' | 'backward' | 'both'
  inversePredicate: string | undefined;
  linkDefinition: UiLinkDefinition;
}