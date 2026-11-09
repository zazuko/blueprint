import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';
import { RdfUiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { flux, rdf } from '@blueprint/ontology';
import { ConfigService, FullTextSearchDialect, LinkConfiguration } from '@blueprint/service/config/config.service';
import { OutgoingRelation } from '../core/component/node-relations/model/node-relation';
import { rdfEnvironment } from '../core/rdf/rdf-environment';
import { ExploredResource } from '../features/explore/model/explored-resource.class';

export const testHttpProviders = [provideHttpClient(), provideHttpClientTesting()];
export const testEndpoint = 'https://fixture.invalid/query';

export function configureTestEndpoint(): HttpTestingController {
  const http = TestBed.inject(HttpTestingController);
  TestBed.inject(ConfigService).fetchConfig().subscribe();
  http.expectOne('/config.json').flush({
    endpointUrl: testEndpoint,
    fullTextSearchDialect: FullTextSearchDialect.FUSEKI,
    skipAuthentication: true,
    ui: { linkConfiguration: LinkConfiguration.BOTH }
  });
  return http;
}

export function resourceFixture(): ExploredResource {
  const graph = rdfEnvironment.parseTurtle(`
    @prefix ex: <http://example.org/> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    ex:root a ex:Root; rdfs:label "Fixture root" .
  `);
  return new ExploredResource(rdfEnvironment.clownface(graph).namedNode('http://example.org/root'));
}

export function nodeFixture(): NodeElement {
  const graph = rdfEnvironment.parseTurtle(`
    @prefix ex: <http://example.org/> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    ex:root a ex:Root; rdfs:label "Fixture root" .
  `);
  return new NodeElement(rdfEnvironment.clownface(graph).namedNode('http://example.org/root'));
}

export function linkFixture(): RdfUiLinkDefinition {
  const graph = rdfEnvironment.parseTurtle(`
    @prefix ex: <http://example.org/> .
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    ex:link sh:name "Fixture relation"; sh:path ex:related .
  `);
  return new RdfUiLinkDefinition(rdfEnvironment.clownface(graph).namedNode('http://example.org/link'));
}

export function relationFixture(): OutgoingRelation {
  const iri = rdfEnvironment.namedNode('http://example.org/relation');
  const graph = rdfEnvironment.dataset().addAll([
    rdfEnvironment.quad(iri, rdf.typeNamedNode, flux.OutgoingRelationNamedNode),
    rdfEnvironment.quad(iri, flux.hasOutgoingPredicateNamedNode, rdfEnvironment.namedNode('http://example.org/related'))
  ]);
  return new OutgoingRelation(rdfEnvironment.clownface(graph).node(iri));
}
