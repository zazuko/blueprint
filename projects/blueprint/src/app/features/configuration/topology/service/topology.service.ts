/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { Injectable } from '@angular/core';
import { TopologyNode, TreeTopology } from './model/topology.model';

import rdfEnvironment from '@zazuko/env';

enum RDF_TYPE {
  DATABASE_SCHEMA = 'http://schema.table.org/DatabaseSchema', // OK
  TABLE = 'http://schema.table.org/Table', // ok
  COLUMN = 'http://schema.table.org/Column', // OK
  BUSINESS_OBJECT = 'http://example.org/ea/BusinessObject', // ok
  ATTRIBUTE = 'http://example.org/ea/Attribute',   // ok
  VALUE_RANGE = 'http://example.org/ea/Range',    // ok
  APPLICATION = 'http://schema.org/SoftwareApplication', // ok
  ORGANIZATION = 'http://schema.org/GovernmentOrganization', // ok
  PERSON = 'http://schema.org/Person'    // OK
}

enum RDF_PREDICATE {
  HAS_TABLE = 'http://schema.table.org/hasTable', // OK
  HAS_COLUMN = 'http://schema.table.org/column',  // OK  
  HAS_ATTRIBUTE = 'http://example.org/ea/assignment', // OK
  HAS_RANGE = 'http://example.org/ea/assignment', // OK
  HAS_BUSINESS_OBJECT = 'http://example.org/ea/assignment', // OK
  HAS_DATABASE_SCHEMA = 'http://example.org/ea/isServedBy', // OK
  HAS_PERSON = 'http://schema.org/employee', // OK
  RESPONSIBLE = 'http://example.org/ea/assignment', // OK
  HAS_APPLICATION = 'http://example.org/ea/assignment' // OK
}

@Injectable({
  providedIn: 'root'
})
export class TopologyService {
  private _topologies: TreeTopology[] = [];




  constructor() {
    const dbSchemaRoot = new TopologyNode(rdfEnvironment.namedNode(RDF_TYPE.DATABASE_SCHEMA), 'Database Schema', 'Database Schema');
    const tableNode = new TopologyNode(rdfEnvironment.namedNode(RDF_TYPE.TABLE), 'Table', 'Table');
    const columnNode = new TopologyNode(rdfEnvironment.namedNode(RDF_TYPE.COLUMN), 'Column', 'Column');

    tableNode.addChild(columnNode, [{ predicate: rdfEnvironment.namedNode(RDF_PREDICATE.HAS_COLUMN), isInverse: true }]);
    dbSchemaRoot.addChild(tableNode, [{ predicate: rdfEnvironment.namedNode(RDF_PREDICATE.HAS_TABLE), isInverse: true }]);

    const dbTree = new TreeTopology(rdfEnvironment.namedNode('dbTree'), 'Database Tree', 'Database Tree', dbSchemaRoot);

    this._topologies.push(dbTree);
  }

  get topologies(): TreeTopology[] {
    return this._topologies.map(t => t);
  }

  getTopologyById(id: string): TreeTopology | null {
    const topology = this._topologies.find(t => t.id === id);
    if (topology) {
      return topology;
    }
    return null;
  }

  getTopologyRelatedToClass(rdfClass: string): TreeTopology[] | null {
    return this._topologies.filter(t => t.hasNode(rdfEnvironment.namedNode(rdfClass)));
  }
}
