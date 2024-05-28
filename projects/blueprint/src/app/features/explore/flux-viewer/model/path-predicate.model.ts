import { Term } from 'rdf-js';

export interface PathPredicate {
  isInverse: boolean;
  iri: string;
  term: Term;
  link: string;
}
