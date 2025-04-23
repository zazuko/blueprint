
import { shacl } from '@blueprint/ontology';

import { SimplePath } from './simple-path';
import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

const simplePathTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path ex:prop1 ;
    ] 
.`;


const inversePathTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path [sh:inversePath ex:prop1] ;
    ] 
.`;


const listPathTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path (ex:prop1) ;
    ] 
.`;


const literalPathTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path "pathAsString" ;
    ] 
.`;

describe('Simple Path Strategy', () => {


    beforeEach(() => {

    });

    it('SimplePath :should transform to SPARQL ', () => {
        const simpleNodePathDataset = rdfEnvironment.parseTurtle(simplePathTtl);
        const pathGraph = rdfEnvironment.clownface(simpleNodePathDataset).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = new SimplePath(path);
            expect(l.toPropertyPath()).toBe('<http://example.org/prop1>');
            const expectedOutput = ['<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('SimplePath: should throw an Exception, when applied to a inverse path ', () => {
        const inverseNodePathDataset = rdfEnvironment.parseTurtle(inversePathTtl);

        const pathGraph = rdfEnvironment.clownface(inverseNodePathDataset).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            expect(() => new SimplePath(path)).toThrowError(TypeError);
        });
    });

    it('SimplePath: should throw an Exception, when applied to a list path ', () => {
        const listNodePathDataset = rdfEnvironment.parseTurtle(listPathTtl);
        const listPathGraph = rdfEnvironment.clownface(listNodePathDataset).out(shacl.pathNamedNode);

        listPathGraph.forEach(path => {
            expect(() => new SimplePath(path)).toThrowError(TypeError);
        });
    });

    it('SimplePath: should throw an Exception, when applied to a literal path', () => {
        const literalNodePathDataset = rdfEnvironment.parseTurtle(literalPathTtl);
        const literalPathGraph = rdfEnvironment.clownface(literalNodePathDataset).out(shacl.pathNamedNode);

        literalPathGraph.forEach(path => {
            expect(() => new SimplePath(path)).toThrowError(TypeError);
        });
    });
});

