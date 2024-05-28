import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LiteralViewerCollection } from './model/ui-detail.model';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';

@Injectable({
  providedIn: 'root'
})
export class UiDetailMetadataService {
  private readonly sparqlService = inject(SparqlService);

  constructor() {
    this.sparqlService.construct(literalViewerQuery).subscribe(console.log);
  }

  queryLiteralViewerMetadata(): Observable<LiteralViewerCollection> {
    return this.sparqlService.construct(literalViewerQuery).pipe(
      map(dataset => new LiteralViewerCollection(dataset))
    );
  }

  queryLiteralViewerMetadataForClass(classIri: string): Observable<LiteralViewerCollection> {
    return this.sparqlService.construct(literalViewerQueryForClassQuery(classIri)).pipe(
      map(dataset => new LiteralViewerCollection(dataset))
    );
  }


}



function literalViewerQueryForClassQuery(rdfClassIri: string): string {
  return `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dash: <http://datashapes.org/dash#>

CONSTRUCT {
    ?literalViewer ?literalViewerP ?literalViewerO.
    ?path sh:inversePath ?pathO.
    ?listRest rdf:first ?head ;
               rdf:rest ?tail .
    ?head ?p ?o .
    ?group ?groupP ?groupO .
} WHERE {
    {
        ?literalViewer dash:viewer dash:LiteralViewer .
        ?literalViewer sh:class <${rdfClassIri}> .
        VALUES ?literalViewerP {
            rdf:type
            rdfs:label
            sh:path
            sh:order
            dash:viewer
            sh:class
            sh:group
        }
        ?literalViewer ?literalViewerP ?literalViewerO.
         OPTIONAL {
             ?literalViewer sh:path ?path .
             ?path sh:inversePath ?pathO.
        }
    }
    UNION {
        ?literalViewer dash:viewer dash:LiteralViewer .
        ?literalViewer sh:class <${rdfClassIri}> .
        ?literalViewer sh:path ?list .
        ?list rdf:rest* ?listRest .
        ?listRest rdf:first ?head ;
                  rdf:rest ?tail .
        OPTIONAL {
            ?head ?p ?o .
        }
    }
    UNION {
        {
          SELECT ?group {
            ?literalViewer dash:viewer dash:LiteralViewer .
            ?literalViewer sh:class <${rdfClassIri}> .
            ?literalViewer sh:group ?group .
          }
        }
        ?group ?groupP ?groupO .
    }
}
`;
}

const literalViewerQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dash: <http://datashapes.org/dash#>

CONSTRUCT {
    ?literalViewer ?literalViewerP ?literalViewerO.
    ?path sh:inversePath ?pathO.
    ?listRest rdf:first ?head ;
               rdf:rest ?tail .
    ?head ?p ?o .
    ?group ?groupP ?groupO .
} WHERE {
    {
        ?literalViewer dash:viewer dash:LiteralViewer .
        VALUES ?literalViewerP {
            rdf:type
            rdfs:label
            sh:path
            sh:order
            dash:viewer
            sh:class
            sh:group
        }
        ?literalViewer ?literalViewerP ?literalViewerO.
         OPTIONAL {
             ?literalViewer sh:path ?path .
             ?path sh:inversePath ?pathO.
        }
    }
    UNION {
        ?literalViewer dash:viewer dash:LiteralViewer .
        ?literalViewer sh:path ?list .
        ?list rdf:rest* ?listRest .
        ?listRest rdf:first ?head ;
                  rdf:rest ?tail .
        OPTIONAL {
            ?head ?p ?o .
        }
    }
    UNION {
        {
          SELECT ?group {
            ?literalViewer dash:viewer dash:LiteralViewer .
            ?literalViewer sh:group ?group .
          }
        }
        ?group ?groupP ?groupO .
    }
}
`;

