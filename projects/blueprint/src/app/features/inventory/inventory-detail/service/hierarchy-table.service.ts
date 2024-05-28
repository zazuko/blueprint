import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import rdfEnvironment from '@zazuko/env';

import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { blueprint, rdf, rdfs } from '@blueprint/ontology';

import { HierarchyService } from '../../../configuration/topology/service/hierarchy.service';

@Injectable({
  providedIn: 'root'
})
export class HierarchyTableService {
  private readonly hierarchyService = inject(HierarchyService);
  private readonly sparqlService = inject(SparqlService);

  getTableForHierarchy(iri: string): Observable<Table> {
    return this.hierarchyService.getHierarchyByIri(iri).pipe(
      switchMap(hierarchy => {
        return this.sparqlService.construct(hierarchy.getDataTableSparqlQuery()).pipe(map(dataset => {
          const cfTable = rdfEnvironment.clownface({ dataset }).node(blueprint.TableNamedNode).in(rdf.typeNamedNode);
          if (cfTable.values.length !== 1) {
            console.error('Expected exactly one table for Registry');
            return {
              header: [],
              data: []
            };
          }

          const headers: ColumnHeader[] = cfTable.out(blueprint.hasHeaderNamedNode).map(header => {
            return {
              icon: header.out(blueprint.faIconNamedNode).value,
              color: header.out(blueprint.colorIndexNamedNode).value,
              label: header.out(blueprint.keyNamedNode).value,
              key: header.out(blueprint.keyNamedNode).value,
              columnIndex: Number(header.out(blueprint.columnIndexNamedNode).value)
            }
          }).sort((a, b) => a.columnIndex - b.columnIndex);

          const rows = cfTable.out(blueprint.hasRowNamedNode).map(row => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rowObject: any = {};
            row.out(blueprint.cellNamedNode).forEach(cell => {
              const key = cell.out(blueprint.keyNamedNode).value;
              const header = headers.find(header => header.key === key);
              if (header) {
                rowObject[header.key] = cell.out(rdfs.labelNamedNode).value;
              } else {
                console.error('Could not find header for key', key);
              }
            });
            return rowObject;
          });
          return {
            header: headers,
            data: rows
          };
        }));
      })
    );
  }
}

export interface Table {
  header: ColumnHeader[];
  data: unknown[];
}

export interface ColumnHeader {
  icon: string;
  color: string;
  label: string;
  key: string;
  columnIndex: number;
}

