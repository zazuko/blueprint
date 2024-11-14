// rdf loader
declare module '*.ttl' {
  import { Quad, DataFactory } from '@rdfjs/types'
  export default function (factory: DataFactory): Quad[];
}
