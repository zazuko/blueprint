/* This file was automatically generated. Do not edit by hand. */

export default ({ factory }: { factory: import('@rdfjs/types').DataFactory }): import('rdf-js').Quad[] => {
  const f = factory
  const ns1 = 'https://ld.flux.zazuko.com/shapes/metadata/'
  const ns2 = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  const ns3 = 'http://www.w3.org/ns/shacl#'
  const ns4 = 'http://www.w3.org/2000/01/rdf-schema#'
  const ns5 = 'http://www.w3.org/2001/XMLSchema#'
  const blankNodes: import('@rdfjs/types').BlankNode[] = []
  for (let i = 0; i < 0; i++) {
    blankNodes.push(f.blankNode())
  }

  return [
    f.quad(
      f.namedNode(`${ns1}SimpleNode`),
      f.namedNode(`${ns2}type`),
      f.namedNode(`${ns3}NodeShape`)
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNode`),
      f.namedNode(`${ns3}name`),
      f.literal('Simple Node Shape')
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNode`),
      f.namedNode(`${ns3}description:`),
      f.literal('SHACL Shape for a Simple UI Node')
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNode`),
      f.namedNode(`${ns3}targetClass`),
      f.namedNode(`${ns4}Class`)
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNode`),
      f.namedNode(`${ns3}property`),
      f.namedNode(`${ns1}SimpleNodeTypeProperty`)
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns2}type`),
      f.namedNode(`${ns3}PropertyShape`)
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}name`),
      f.literal('nodeType')
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}path`),
      f.namedNode(`${ns2}type`)
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}description`),
      f.literal('The type of this thing')
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}datatype`),
      f.namedNode(`${ns5}string`)
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}maxCount`),
      f.literal('1', f.namedNode(`${ns5}integer`))
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}minCount`),
      f.literal('1', f.namedNode(`${ns5}integer`))
    ),
    f.quad(
      f.namedNode(`${ns1}SimpleNodeTypeProperty`),
      f.namedNode(`${ns3}message`),
      f.literal('Invalid type Property')
    )
  ]
}
