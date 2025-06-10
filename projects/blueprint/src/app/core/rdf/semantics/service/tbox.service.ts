import { Injectable } from '@angular/core';

import { rdfEnvironment, RdfTypes } from '../../rdf-environment';
import { PredicateTBox } from '../predicate-t-box';
import { GraphPointer } from 'clownface';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { rdf } from '@blueprint/ontology';

@Injectable({
  providedIn: 'root'
})
export class TBoxService {
  #tBoxDataset: RdfTypes.Dataset;

  #containsTBoxSet: Set<string>;


  constructor() {
    this.#tBoxDataset = rdfEnvironment.dataset();
    this.#containsTBoxSet = new Set<string>();
  }


  getPredicateTBox(predicateIri: string): PredicateTBox | undefined {
    if (this.#containsTBoxSet.has(predicateIri)) {
      const node = rdfEnvironment.clownface(this.#tBoxDataset).namedNode(predicateIri);
      if (node.out().values.length > 0) {
        return new PredicateTBox(node);
      }
      this.#containsTBoxSet.delete(predicateIri);
    }
    return undefined;
  }

  addPredicateTBoxes(dataset: RdfTypes.Dataset): void {
    const rdfPredicates = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#Property').in(rdf.typeNamedNode);
    const owlObjectProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#ObjectProperty').in(rdf.typeNamedNode);
    const owlDatatypeProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#DatatypeProperty').in(rdf.typeNamedNode);
    const owlAnnotationProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#AnnotationProperty').in(rdf.typeNamedNode);
    const owlFunctionalProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#FunctionalProperty').in(rdf.typeNamedNode);
    const owlInverseFunctionalProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#InverseFunctionalProperty').in(rdf.typeNamedNode);
    const owlTransitiveProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#TransitiveProperty').in(rdf.typeNamedNode);
    const owlSymmetricProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#SymmetricProperty').in(rdf.typeNamedNode);
    const owlAsymmetricProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#AsymmetricProperty').in(rdf.typeNamedNode);
    const owlReflexiveProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#ReflexiveProperty').in(rdf.typeNamedNode);
    const owlIrreflexiveProperties = rdfEnvironment.clownface(dataset).namedNode('http://www.w3.org/2002/07/owl#IrreflexiveProperty').in(rdf.typeNamedNode);

    rdfPredicates.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlObjectProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlDatatypeProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlAnnotationProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlFunctionalProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlInverseFunctionalProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlTransitiveProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlSymmetricProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlAsymmetricProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlReflexiveProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
    owlIrreflexiveProperties.forEach(p => {
      this.addPredicateTBox(p);
    });
  }

  addPredicateTBox(predicateGraphPointer: GraphPointer): void {
    const predicateIri = predicateGraphPointer.value;

    if (this.#containsTBoxSet.has(predicateIri)) {
      return;
    }
    const predicateDataset = ClownfaceObject.describeCDBForNode(predicateGraphPointer);
    if (predicateDataset.size === 0) {
      console.warn(`TBox for predicate ${predicateIri} is empty. Not adding to TBox dataset.`);
      return;
    }
    this.#containsTBoxSet.add(predicateIri);
    this.#tBoxDataset.addAll(predicateDataset);
  }

}
