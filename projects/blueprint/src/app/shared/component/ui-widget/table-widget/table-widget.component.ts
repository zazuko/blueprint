import { Component, computed, input } from '@angular/core';
import { BaseUiWidget } from '../base-ui-widget.class';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';

import { TableModule } from 'primeng/table';

import { blueprint, shacl } from '@blueprint/ontology';
import { GraphPointer } from 'clownface';
import rdfEnvironment from '@zazuko/env';

@Component({
  selector: 'bp-table-widget',
  standalone: true,
  imports: [TableModule],
  templateUrl: './table-widget.component.html',
  styleUrl: './table-widget.component.scss'
})
export class TableWidgetComponent implements BaseUiWidget<GraphPointer | Table> {
  data = input.required<GraphPointer | Table>();

  computedData = computed<Table>(() => {
    const data = this.data();

    if (Array.isArray((data as GraphPointer).values)) {
      return new RdfTable(data as GraphPointer);
    }

    return data as Table;

  });

  columns = computed<ColumnDefinition[]>(() => {
    const def = this.computedData().columns.map(c => ({ header: c.header, field: c.header }));
    console.log('columns', def);
    return def;
  });


}

interface ColumnDefinition {
  header: string;
  field: string;
}

interface Table {
  columns: Column[];
  rows: Row[];
}

interface Row {
  [key: string]: string;
}

interface Column {
  header: string;
  predicateIri: string;
}

class RdfTable extends ClownfaceObject implements Table {
  #columns: RdfColumn[] | undefined;
  #rows: Row[] | undefined;

  constructor(node: GraphPointer) {
    super(node);
  }

  get columns(): RdfColumn[] {
    if (this.#columns === undefined) {
      this.#columns = this._node.out(blueprint.hasColumnNamedNode).map(c => new RdfColumn(c));
    }
    return this.#columns;
  }

  get rows(): Row[] {
    if (this.#rows === undefined) {
      this.#rows = this._node.out(blueprint.hasRowNamedNode).map(r => {
        const row: Row = {};
        this.columns.forEach(c => {
          row[c.header] = r.out(rdfEnvironment.namedNode(c.predicateIri)).values.join(', ');
        });
        return row;
      });
    }
    return this.#rows;
  }



}

class RdfColumn extends ClownfaceObject implements Column {
  #header: string | undefined;
  #predicateIri: string | undefined;
  #order: number | undefined;

  constructor(node: GraphPointer) {
    super(node);
  }

  get header(): string {
    if (this.#header === undefined) {
      this.#header = this._node.out(blueprint.labelNamedNode).values.join(', ');
    }
    return this.#header;
  }

  get predicateIri(): string {
    if (this.#predicateIri === undefined) {
      this.#predicateIri = this._node.out(shacl.pathNamedNode).value;
      if (this.#predicateIri === undefined) {
        throw new Error('Column must have a predicate');
      }
    }
    return this.#predicateIri;
  }

  get order(): number {
    if (this.#order === undefined) {
      this.#order = this._node.out(shacl.orderNamedNode).values.length > 0 ? Number(this._node.out(shacl.orderNamedNode).values[0]) : 0;
    }
    return this.#order;
  }

}