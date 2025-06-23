/**
PREFIX schema: <http://schema.org/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
  
 SELECT * WHERE {
  {
    # get predicates that are an inverse of eachother and are used in relation to the subject
    {
      SELECT  DISTINCT ?outBidiP ?inBidiP  WHERE {
        BIND(<https://register.ld.admin.ch/staatskalender/organization/10000033> as ?subject)
        <https://register.ld.admin.ch/staatskalender/organization/10000033> ?outBidiP ?object . 
        ?object ?inBidiP <https://register.ld.admin.ch/staatskalender/organization/10000033> . 
        ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP . 
      }
    }
  } 
}`;
    console.log('Bidirectional Predicates Query:', query);
    return query;
}
 */

import { flux, schema, owl, rdf, rdfs } from "@blueprint/ontology";
import { rdfEnvironment } from "../../../rdf/rdf-environment";

export function getPredicatesWithCount(iri: string): string {
    const input = rdfEnvironment.namedNode(iri);

    const inputValue = input.value;

    const query = `

${flux.sparqlPrefix()}
${owl.sparqlPrefix()}
${schema.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}

CONSTRUCT {
    ?subject ${flux.hasRelationPrefixed} ?relationIri .
    ?relationIri a ${flux.BidirectionalRelationPrefixed} .
    ?relationIri ${flux.hasIncomingPredicatePrefixed} ?inBidiP .
    ?relationIri ${flux.hasOutgoingPredicatePrefixed} ?outBidiP .

    # 3 get count bidis
    ?relationIri2 ${flux.countPrefixed} ?count .

    # 3. get the non bidi out relations for bidi connecitons
    ?subject ${flux.hasRelationPrefixed} ?relationIri3 .
    ?relationIri3 a ${flux.OutgoingRelationPrefixed} .
    ?relationIri3 ${flux.hasOutgoingPredicatePrefixed} ?outBidiP .

    # 4. get the non bidi out relations for bidi connecitons
    ?relationIri4 a ${flux.IncomingRelationPrefixed} .
    ?relationIri4 ${flux.hasIncomingPredicatePrefixed} ?inBidiP .

    # 4.1 get the non bidi out predicates with count
    ?relationIri4_1 ${flux.countPrefixed} ?count .

    # 5. get the non-bidi out predicates
    ?subject ${flux.hasRelationPrefixed} ?relationIri5 .
    ?relationIri5 a ${flux.OutgoingRelationPrefixed} .
    ?relationIri5 ${flux.hasOutgoingPredicatePrefixed} ?outP .

    # 6. get the non-bidi out predicates with count
    ?relationIri6 ${flux.countPrefixed} ?count .

     # 7. get the non-bidi in predicates
    ?subject ${flux.hasRelationPrefixed} ?relationIri7 .
    ?relationIri7 a ${flux.IncomingRelationPrefixed} .
    ?relationIri7 ${flux.hasIncomingPredicatePrefixed} ?inP .

    # 8. get the non-bidi in predicates with count
    ?relationIri8 ${flux.countPrefixed} ?count .

    # 9. attach tbox
    ?outP ?outPP ?outTbox.
    ?inP ?inPP ?inTbox .

} WHERE  {
 {
    # get predicates that are an inverse of eachother and are used in relation to the subject
    {
      SELECT  DISTINCT ?outBidiP ?inBidiP ?subject WHERE {
        BIND(<${iri}> as ?subject)
        <${iri}> ?outBidiP ?object . 
        ?object ?inBidiP <${iri}> . 
        ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP .
      }
    }
    BIND( IRI(CONCAT(str(?outBidiP), str(?inBidiP))) as ?relationIri )
 } UNION {
    # get count 
    {
        SELECT (COUNT(?target ) as ?count) ?relationIri2 WHERE {
        # get predicates that are an inverse of eachother and are used in relation to the subject
            {
                SELECT  DISTINCT ?outBidiP ?inBidiP  WHERE {
                    BIND(<${iri}> as ?subject)
                    <${iri}> ?outBidiP ?object . 
                    ?object ?inBidiP <${iri}> . 
                    ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP .
                }
            }
            BIND( IRI(CONCAT(str(?outBidiP), str(?inBidiP))) as ?relationIri2 )
            <${iri}> ?outBidiP ?target .
            ?target ?inBidiP <${iri}> .
        } GROUP BY ?relationIri2
    }
    # get predicates that are an inverse of eachother and are used in relation to the subject
    {
      SELECT  DISTINCT ?outBidiP ?inBidiP  WHERE {
        BIND(<${iri}> as ?subject)
        <${iri}> ?outBidiP ?object . 
        ?object ?inBidiP <${iri}> . 
        ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP .
      }
    }
    BIND( IRI(CONCAT(str(?outBidiP), str(?inBidiP))) as ?relationIri )
 } UNION {
  # non bidi out relations 
  # this i exotic an a bit a mistake. these becomes somethig if there are relation missing the inverseOf and there estis stuff with it 
    {
        SELECT  DISTINCT ?outBidiP ?inBidiP WHERE {
            BIND(<${iri}> as ?subject)
            <${iri}> ?outBidiP ?object . 
            ?object ?inBidiP <${iri}> . 
            ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP .
        }
    }
    BIND( <${iri}> as ?subject )
    <${iri}> ?outBidiP ?target .
    MINUS {
        ?target ?inBidiP <${iri}>  .
    }
    
    BIND( IRI(CONCAT(str(?subject), str(?outBidiP))) as ?relationIri3 )
 }
 UNION {
  # non bidi in relations 
  # this i exotic an a bit a mistake. these becomes somethig if there are relation missing the inverseOf and there estis stuff with it 
    {
        SELECT  DISTINCT ?outBidiP ?inBidiP WHERE {
            BIND(<${iri}> as ?subject)
            <${iri}> ?outBidiP ?object . 
            ?object ?inBidiP <${iri}> . 
            ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP .
        }
    }
    BIND( <${iri}> as ?subject )
    ?target ?inBidiP <${iri}>  .
    MINUS {
        <${iri}> ?outBidiP ?target .
    }
    
    BIND( IRI(CONCAT(str(?subject), str(?inBidiP))) as ?relationIri4 )
 } 
 UNION {
  # non bidi in relations  count 
  # this i exotic an a bit a mistake. these becomes somethig if there are relation missing the inverseOf and there estis stuff with it 
  {
    SELECT (COUNT(?target) as ?count) ?relationIri4_1 WHERE {
        {
            SELECT  DISTINCT ?outBidiP ?inBidiP WHERE {
                BIND(<${iri}> as ?subject)
                <${iri}> ?outBidiP ?object . 
                ?object ?inBidiP <${iri}> . 
                ?inBidiP schema:inverseOf|owl:inverseOf ?outBidiP .
            }
        }
        BIND( <${iri}> as ?subject )
        ?target ?inBidiP <${iri}>  .
        MINUS {
            <${iri}> ?outBidiP ?target .
        }
        
        BIND( IRI(CONCAT(str(?subject), str(?inBidiP))) as ?relationIri4_1)
        }
    GROUP BY ?relationIri4_1
}
 }
UNION {
    # the 5. get the non bidi out predicates (those without owl:inverseOf or schema:inverseOf)
    {
        SELECT DISTINCT ?outP WHERE {
            BIND(<${iri}> as ?subject)
            <${iri}> ?outP ?target .
            FILTER(isIRI(?target))
            FILTER(?outP != ${rdf.typePrefixed})
        }
    }
    BIND( <${iri}> as ?subject )
    MINUS {
      ?outP owl:inverseOf|schema:inverseOf ?anyInverse .
    }
    BIND( IRI(CONCAT(str(?subject), str(?outP))) as ?relationIri5 )
 } UNION {
    # the 6. get the non bidi in predicates with count (those without owl:inverseOf or schema:inverseOf)
    {
        SELECT (COUNT(?target) as ?count) ?relationIri6 WHERE {
            {
                SELECT DISTINCT ?outP WHERE {
                    BIND(<${iri}> as ?subject)
                    <${iri}> ?outP ?target  .
                    FILTER(isIRI(?target))
                }
            }
            BIND( <${iri}> as ?subject )
            MINUS {
                ?outP owl:inverseOf|schema:inverseOf ?anyInverse .
            }
            BIND( IRI(CONCAT(str(?subject), str(?outP))) as ?relationIri6 )
            <${iri}> ?outP ?target  .
            FILTER(isIRI(?target))
        } GROUP BY ?relationIri6
    }
 } UNION {
    # the 7. get the non bidi in predicates (those without owl:inverseOf or schema:inverseOf)
    {
        SELECT DISTINCT ?inP WHERE {
            BIND(<${iri}> as ?subject)
            ?target ?inP <${iri}>  .
            FILTER(isIRI(?target))
        }
    }
    BIND( <${iri}> as ?subject )
    MINUS {
      ?inP owl:inverseOf|schema:inverseOf ?anyInverse .
    }
    BIND( IRI(CONCAT(str(?subject), str(?inP))) as ?relationIri7 )
 } UNION {
    # the 8. get the non bidi in predicates with count (those without owl:inverseOf or schema:inverseOf)
    {
        SELECT (COUNT(?target) as ?count) ?relationIri8 WHERE {
            {
                SELECT DISTINCT ?inP WHERE {
                    BIND(<${iri}> as ?subject)
                    ?target ?inP <${iri}>  .
                    FILTER(isIRI(?target))
                }
            }
            BIND( <${iri}> as ?subject )
            MINUS {
                ?inP owl:inverseOf|schema:inverseOf ?anyInverse .
            }
            BIND( IRI(CONCAT(str(?subject), str(?inP))) as ?relationIri8 )
            ?target ?inP <${iri}>  .
            FILTER(isIRI(?target))
        } GROUP BY ?relationIri8
    }
 } UNION {
    # the 9. attche tbox
    {
        SELECT DISTINCT ?outP WHERE {
            <${iri}> ?outP ?target .
            FILTER(isIRI(?target))
        }  
    }
    {
        SELECT DISTINCT ?inP WHERE {
            ?target ?inP <${iri}> .
            FILTER(isIRI(?target))
        }  
    }
    ?outP ?outPP ?outTbox.
    ?inP ?inPP ?inTbox .
    
 }
    
} 
`;

    return query;
}