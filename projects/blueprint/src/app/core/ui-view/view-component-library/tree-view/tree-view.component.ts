import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NodeElement } from '../../../model/node-element/node-element.class';
import { TreeNode } from 'primeng/api';
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree';
import { Avatar, AvatarComponent } from '@blueprint/component/avatar/avatar.component';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { UiDetailService } from '@blueprint/service/ui-config/ui-detail/ui-detail.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { RdfDetailConfigurationElement } from '@blueprint/service/ui-config/ui-detail/model/ui-detail-configuration-element';
import { blueprint, rdfs, shacl } from '@blueprint/ontology';
import { sparqlUtils } from '@blueprint/utils';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { GraphPointer } from 'clownface';

import rdfEnvironment from '@zazuko/env';
import { TableModule } from 'primeng/table';
import { LiteralRenderType } from '../../../service/ui-config/ui-detail/model/ui-detail-configuration-element';
/**
 * TreeViewComponent
 * 
 * @input data: TreeNode<NodeElement>[]
 * @input label: string
 */
@Component({
  selector: 'bp-tree-view',
  standalone: true,
  imports: [
    TreeModule,
    AvatarComponent,
    AvatarModule,
    BadgeModule,
    TableModule,
  ],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss'
})
export class TreeViewComponent {
  data = input.required<TreeNode<NodeElement>[]>();
  label = input<string>('');
  nodeSelected = output<string>();

  #detailService = inject(UiDetailService);
  #sparqlService = inject(SparqlService);

  LiteralViewType = LiteralRenderType;
  selectedClassIri = signal<string | null>(null);


  table = toSignal<Table>(
    toObservable(this.selectedClassIri).pipe(
      switchMap(classIri => {
        if (!classIri) {
          return of([]);
        }
        return this.#detailService.getDetailConfigurationForClass(classIri);
      }),
      switchMap((detailConfig: RdfDetailConfigurationElement[]) => {
        /*    if (detailConfig.length < 1) {
              return of({ columns: [], rows: [] } as Table);
            }
    
            */
        const data = this.data();
        if (data.length < 1) {
          return of({ columns: [], rows: [] } as Table);
        }

        const flattenTree = (nodes: TreeNode<NodeElement>[]): NodeElement[] => {
          return nodes.reduce((acc, node) => {
            acc.push(node.data);
            if (node.children) {
              acc.push(...flattenTree(node.children));
            }
            return acc;
          }, [] as NodeElement[]);
        };

        const flattenedData = flattenTree(data);
        const iris = flattenedData.filter(node => node.avatars.find(a => a.classIri === this.selectedClassIri())).map(node => node.iri);
        if (iris.length < 1) {
          return of({ columns: [], rows: [] } as Table);
        }
        const rowValues = `VALUES ?row { ${iris.map(iri => `<${iri}>`).join(' ')} }`;
        let constructBody = '';
        constructBody += `<http://localhost/rdfs/label> ${rdfs.labelPrefixed} 'Label'.\n`;
        constructBody += `<http://localhost/rdfs/label> ${shacl.orderPrefixed} -1.\n`;
        constructBody += `<http://localhost/rdfs/label> ${blueprint.showAsPrefixed} <https://ld.flux.zazuko.com/shapes/metadata/Plain>.\n`;

        const predicates: string[] = [];

        predicates.push(`(${rdfs.labelPrefixed} <http://localhost/rdfs/label>)`);
        detailConfig.forEach(config => {
          constructBody += `<${config.iri}> ${rdfs.labelPrefixed} '${config.label}'.\n`;
          constructBody += `<${config.iri}> ${shacl.orderPrefixed} ${config.order}.\n`;
          constructBody += `<${config.iri}> ${blueprint.showAsPrefixed} <${config.renderLiteralAsNode}>.\n`;

          predicates.push(`(<${config.path}> <${config.iri}>)`);
        }
        );

        constructBody += ` ?row ?detail [
  	${blueprint.valuePrefixed} ?o ;
    ${blueprint.hasRowPrefixed} ?detail ;
  ].
  <http://localhost/Table> a ${blueprint.TablePrefixed} ;
    ${blueprint.hasRowPrefixed} ?row ;
    ${blueprint.hasColumnPrefixed} ?detail .
  \n`;

        const query = `
        ${rdfs.sparqlPrefix()}
        ${blueprint.sparqlPrefix()}
        ${shacl.sparqlPrefix()}

         CONSTRUCT { ${constructBody} } WHERE {
         VALUES (?p ?detail) { ${predicates.join(' ')} }
         ${rowValues}

          ?row ?p ?o .
          }
         `;

        console.log(sparqlUtils.format(query));
        return this.#sparqlService.construct(sparqlUtils.format(query)).pipe(
          map(result => {
            const tableArray = rdfEnvironment.clownface({ dataset: result, term: rdfEnvironment.namedNode('http://localhost/Table') }).map(n => new RdfTable(n));

            if (tableArray.length !== 1) {
              return { columns: [], rows: [] } as Table;
            }
            const table = tableArray[0];

            const columns = table.columns.sort((a, b) => a.order - b.order);
            const rows = table.rows;
            return { columns, rows } as Table;

          })
        );
      }
      )));





  typeAggregate = computed<TypeAggregate[]>(() => {
    const treeData = this.data();
    const level1 = treeData[0].children;

    const typeCountMap = new Map<string, TypeAggregate>();
    level1.forEach(node => {
      node.data.classLabel.forEach((classLabel, index) => {
        const avatar = node.data.avatars[index];
        if (!typeCountMap.has(classLabel)) {
          typeCountMap.set(classLabel, { avatar, label: classLabel, count: 0 });
        }
        const aggregate = typeCountMap.get(classLabel);
        aggregate.count++;
        typeCountMap.set(classLabel, aggregate);
      });
    });

    return [...typeCountMap.values()];

  });

  emitNodeSelected(event: TreeNodeSelectEvent) {
    this.nodeSelected.emit(event.node.data.iri);
  }

  selectClassIri(iri: string) {
    this.selectedClassIri.set(iri);
  }


  constructor() {
    effect(() => {

      const table = this.table();
      console.log(table.columns.map(c => c.label).join(', '));

      const oneRow = table.rows[0];
      if (!oneRow) {
        return;
      }
      console.log(oneRow.iri);
      console.log(oneRow.cells);
      console.log(oneRow.cells.get(oneRow.cells.keys().next().value).showAs);
    });
  }
}

interface TypeAggregate {
  label: string;
  count: number;
  avatar: Avatar;
}


interface Table {
  columns: TableColumn[];
  rows: TableRow[];
}

interface TableColumn {
  label: string;
  iri: string;
  order: number;
}


class RdfTable extends ClownfaceObject implements Table {
  #_columns: TableColumn[] | null = null;
  #_rows: TableRow[] | null = null;

  constructor(pointer: GraphPointer) {
    super(pointer);
  }

  get columns(): TableColumn[] {
    if (this.#_columns === null) {
      this.#_columns = this._node.out(blueprint.hasColumnNamedNode).map(pointer => new RdfTableColumn(pointer));
    }
    return this._node.out(blueprint.hasColumnNamedNode).map(n => new RdfTableColumn(n));
  }

  get rows(): TableRow[] {
    if (this.#_rows === null) {
      this.#_rows = this._node.out(blueprint.hasRowNamedNode).map(node => {
        const iri = node.value;

        const predicates = ClownfaceObject.getPredicatesForNode(node);
        const cellMap = new Map<string, TableCell>();

        predicates.forEach(pred => {
          const value = node.out(rdfEnvironment.namedNode(pred)).out(blueprint.valueNamedNode).value ?? '';
          const rendererIri = node.out(rdfEnvironment.namedNode(pred)).out(blueprint.hasRowNamedNode).out(blueprint.showAsNamedNode).value;
          let showAs: LiteralRenderType = LiteralRenderType.PHONE;
          switch (rendererIri) {
            case 'https://ld.flux.zazuko.com/shapes/metadata/Link':
              showAs = LiteralRenderType.LINK;
              break;
            case 'https://ld.flux.zazuko.com/shapes/metadata/Email':
              showAs = LiteralRenderType.EMAIL;
              break;
            case 'https://ld.flux.zazuko.com/shapes/metadata/PhoneNumber':
              showAs = LiteralRenderType.PHONE;
              break;
            case 'https://ld.flux.zazuko.com/shapes/metadata/Plain':
              showAs = LiteralRenderType.PLAIN;
              break;
            case 'https://ld.flux.zazuko.com/shapes/metadata/Boolean':
              showAs = LiteralRenderType.BOOLEAN;
              break;
            default:
              showAs = LiteralRenderType.UNKNOWN;
          }
          const cell = {
            iri: node.value,
            value,
            showAs
          } as TableCell;
          cellMap.set(pred, cell);
        });
        return { iri, cells: cellMap };
      });
    }
    return this.#_rows;
  }



}

interface TableRow {
  iri: string;
  cells: Map<string, TableCell>;
}

interface TableCell {
  iri: string;
  value: string;
  showAs: LiteralRenderType;
}


class RdfTableColumn extends ClownfaceObject implements TableColumn {
  private _label: string | null = null;
  private _order: number | null = null;

  constructor(pointer: GraphPointer) {
    super(pointer);
  }

  get label(): string {
    if (this._label === null) {
      this._label = this._node.out(rdfs.labelNamedNode).value ?? '';
    }
    return this._label;
  }

  get order(): number {
    if (this._order === null) {
      this._order = Number(this._node.out(shacl.orderNamedNode).value ?? 0);
    }
    return this._order;
  }
}