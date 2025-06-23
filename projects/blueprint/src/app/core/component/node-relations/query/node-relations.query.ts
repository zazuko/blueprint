import { rdf, rdfs, flux } from "@blueprint/ontology";



export function getNodeRelationsQuery(iri: string): string {
    const query = `
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${flux.sparqlPrefix()}
  
  CONSTRUCT {
    # the center is the predicate
    ?ppp ?tboxPredicate ?tboxO .

    ?po a ${flux.RelationPrefixed} .
    ?po ${flux.toPrefixed} ?object .
    ?po ${flux.fromPrefixed} ?subject .
  
    # fill with content
    ?subject ?predicate ?literal .
    ?object ?poo ?ooLiteral .

    ?subject ${rdf.typePrefixed} ?type .
    # change this to tranitive type
    ?subject ${flux.inferredTypePrefixed} ?transitiveType .

    ?ppp ?tboxPredicate ?tboxO .

    ?object3 ${flux.inferredTypePrefixed} ?transitiveType3 .
    ?object3 ${rdf.typePrefixed} ?type3 .

    ?inpp ?tboxPredicate ?tboxO .

    ?inSubject ${flux.inferredTypePrefixed} ?transitiveType3 .
    ?inSubject ${rdf.typePrefixed} ?type3 .

    # predicate in
    ?pi a ${flux.RelationPrefixed} .
    ?pi ${flux.fromPrefixed} ?inSubject .
    ?pi ${flux.toPrefixed} ?subject .
    
    ?inSubject ?poo ?ooLiteral .
        

  } WHERE {
    {
        # get subject literals
        BIND (<${iri}> as ?subject)
        <${iri}> ?predicate ?literal .
        FILTER(isLiteral(?literal))
    } UNION {
        # get subject object 
        BIND (<${iri}> as ?subject)
        <${iri}> ?po ?object.
        FILTER(isIRI(?object))
        ?object ?poo ?ooLiteral .
        FILTER(isLiteral(?ooLiteral))
    } UNION {
        # get subject type
        BIND (<${iri}> as ?subject)
        <${iri}> ${rdf.typePrefixed} ?type .      
        <${iri}> ${rdf.typePrefixed}/${rdfs.subClassOfPrefixed} ?transitiveType .
    } UNION {
        # get out predicate tbox
        {
            SELECT DISTINCT ?ppp WHERE {
                <${iri}> ?ppp ?object .
                FILTER(isIRI(?object))
            }    
        }
        ?ppp ?tboxPredicate ?tboxO .
    } UNION {
        # get out object types
        <${iri}> ?po ?object3.
        ?object3 ${rdf.typePrefixed}/${rdfs.subClassOfPrefixed}* ?transitiveType3 .
        ?object3 ${rdf.typePrefixed} ?type3 .
    } UNION {
        # get out predicate tbox
        {
            SELECT DISTINCT ?inpp WHERE {
                ?o ?inpp <${iri}>  .
            }    
        }
        ?inpp ?tboxPredicate ?tboxO .
    } UNION {
        # get in subject types
        ?inSubject ?pi <${iri}>.
        ?inSubject ${rdf.typePrefixed}/${rdfs.subClassOfPrefixed}* ?transitiveType3 .
        ?inSubject ${rdf.typePrefixed} ?type3 .
    } UNION {
        # get subject object 
        BIND (<${iri}> as ?subject)
        ?inSubject ?pi <${iri}>.
        ?inSubject ?poo ?ooLiteral .
        FILTER(isLiteral(?ooLiteral))
    } 

}
`;

    return query
}