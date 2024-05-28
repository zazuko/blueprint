import { inject, Injectable } from '@angular/core';
import { Dataset } from '@rdfjs/types';
import { forkJoin, map, Observable, shareReplay } from 'rxjs';

import { SparqlService } from '../sparql/sparql.service';
import { ShapeToSparql } from '../../../../../../flux-library/src/lib/utils/shape-to-sparql.class';
import { ShapeService } from '../shape/shape.service';

@Injectable({
  providedIn: 'root',
})
export class MetadataShapeService {
  private readonly sparqlClient = inject(SparqlService);
  private readonly appShapes = inject(ShapeService);

  private typeMetadataCache$: Observable<Dataset>;

  constructor() {
    this.typeMetadata$.subscribe({ error: console.error });
  }

  get typeMetadata$(): Observable<Dataset> {
    if (!this.typeMetadataCache$) {
      const requests = [this.requestType(), this.requestTypeMetadata()];
      this.typeMetadataCache$ = forkJoin(requests).pipe(
        map((datasets) => {
          return datasets[0]
            .addAll(datasets[1])
            .addAll(this.appShapes.classMetadataGraph);
        }),
        shareReplay(1)
      );
    }
    return this.typeMetadataCache$;
  }

  private requestTypeMetadata(): Observable<Dataset> {
    const classMetadataShape = this.appShapes.classMetadataGraph;

    const query = ShapeToSparql.instance.queryFromNodeShape(classMetadataShape);

    return this.sparqlClient.construct(query);
  }

  private requestType(): Observable<Dataset> {
    const typeShape = this.appShapes.typeShapeGraph;

    const query = ShapeToSparql.instance.queryFromNodeShape(typeShape);

    return this.sparqlClient.construct(query);
  }

}
