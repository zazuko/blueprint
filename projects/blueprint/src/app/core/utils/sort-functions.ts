import { AnyPointer } from 'clownface';
import { shacl } from '@blueprint/ontology';

export function sortStrings(a: string, b: string): number {
  // create an array sort with localeCompare
  return a.localeCompare(b);
}

export function labelAlphaSort(a: ObjectWithLabel, b: ObjectWithLabel): number {
  return a.label.localeCompare(b.label);
}

export function shaclPropertyByOrder(a: AnyPointer, b: AnyPointer): number {
  const aOrder = Number(a.out(shacl.orderNamedNode).value);
  const bOrder = Number(b.out(shacl.orderNamedNode).value);

  if (isNaN(aOrder) && isNaN(bOrder)) {
    return 0;
  }
  if (isNaN(aOrder)) {
    return -1;
  }
  if (isNaN(bOrder)) {
    return 1;
  }
  if (aOrder < bOrder) {
    return -1;
  }
  if (aOrder > bOrder) {
    return 1;
  }
  return 0;
}

interface ObjectWithLabel {
  label: string;
}
