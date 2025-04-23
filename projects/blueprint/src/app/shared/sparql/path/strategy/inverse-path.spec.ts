
import { shacl } from '@blueprint/ontology';

import { Parser } from 'n3';
import { InversePath } from './inverse-path';
import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

const parser = new Parser();

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


describe('Inverse Path Strategy', () => {


    beforeEach(() => {

    });

    it('InversePath: should transform to SPARQL ', () => {
        const inverseNodePathDataset = rdfEnvironment.parseTurtle(inversePathTtl);

        const pathGraph = rdfEnvironment.clownface(inverseNodePathDataset).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = new InversePath(path);
            expect(l.toPropertyPath()).toBe('^<http://example.org/prop1>');
            const expectedOutput = ['^<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });
    });


    it('InversePath: should throw an Exception, when applied to a forward path ', () => {
        const ds = rdfEnvironment.parseTurtle(simplePathTtl);

        const pathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            expect(() => new InversePath(path)).toThrowError(TypeError);
        });
    });

    it('InversePath: should throw an Exception, when applied to a list path ', () => {
        const ds = rdfEnvironment.parseTurtle(listPathTtl);
        const listPathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);

        listPathGraph.forEach(path => {
            expect(() => new InversePath(path)).toThrowError(TypeError);
        });
    });

    it('InversePath: should throw an Exception, when applied to a literal path ', () => {
        const ds = rdfEnvironment.parseTurtle(literalPathTtl);
        const literalPathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);

        literalPathGraph.forEach(path => {
            expect(() => new InversePath(path)).toThrowError(TypeError);
        });
    });

});
