import { Injectable } from '@angular/core';

import rdfEnvironment from '@zazuko/env';
import { Dataset, Quad } from '@rdfjs/types';

import { fluxMetadataShapes } from '../../../../../../flux-library/src/lib/namespace/namespace';

import fluxClassMetaQuads from '../../../../../../flux-library/src/lib/shapes/flux-class-metadata.shape';
import fluxTypeShapesQuads from '../../../../../../flux-library/src/lib/shapes/flux-type.shape';

@Injectable({
  providedIn: 'root',
})
export class ShapeService {
  private readonly classMetadataNamedGraph = rdfEnvironment.namedNode(fluxMetadataShapes['ClassShape'].value);
  private readonly typeNamedGraph = rdfEnvironment.namedNode(fluxMetadataShapes['FluxTypeShape'].value);

  private shapeDataset: Dataset = null;

  constructor() {
    this.shapeDataset = rdfEnvironment.dataset(
      fluxClassMetaQuads({ factory: rdfEnvironment }).map((quad: Quad) => {
        quad.graph = this.classMetadataNamedGraph;
        return quad;
      })
    ) as unknown as Dataset;
    this.shapeDataset.addAll(
      fluxTypeShapesQuads({ factory: rdfEnvironment }).map((quad: Quad) => {
        quad.graph = this.typeNamedGraph;
        return quad;
      })
    );
  }

  get typeShapeGraph(): Dataset {
    return this.shapeDataset.match(null, null, null, this.typeNamedGraph) as Dataset;
  }

  get classMetadataGraph(): Dataset {
    return this.shapeDataset.match(
      null,
      null,
      null,
      this.classMetadataNamedGraph
    ) as Dataset;
  }
}
