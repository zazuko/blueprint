import { Term } from '@rdfjs/types';

export interface PathPredicate {
  isInverse: boolean;
  iri: string;
  term: Term;
  link: string;
}
