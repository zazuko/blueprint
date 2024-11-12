
import { shacl } from '@blueprint/ontology';
import rdfEnvironment from '@zazuko/env';

import { Parser } from 'n3';
import { InversePath } from './inverse-path';

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
        const inverseNodePathDataset = rdfEnvironment.dataset(parser.parse(inversePathTtl));

        const pathGraph = rdfEnvironment.clownface({ dataset: inverseNodePathDataset }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = new InversePath(path);
            expect(l.toPropertyPath()).toBe('^<http://example.org/prop1>');
            const expectedOutput = ['^<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });
    });


    it('InversePath: should throw an Exception, when applied to a forward path ', () => {
        const ds = rdfEnvironment.dataset(parser.parse(simplePathTtl));

        const pathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            expect(() => new InversePath(path)).toThrowError(TypeError);
        });
    });

    it('InversePath: should throw an Exception, when applied to a list path ', () => {
        const ds = rdfEnvironment.dataset(parser.parse(listPathTtl));
        const listPathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);

        listPathGraph.forEach(path => {
            expect(() => new InversePath(path)).toThrowError(TypeError);
        });
    });

    it('InversePath: should throw an Exception, when applied to a literal path ', () => {
        const ds = rdfEnvironment.dataset(parser.parse(literalPathTtl));
        const literalPathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);

        literalPathGraph.forEach(path => {
            expect(() => new InversePath(path)).toThrowError(TypeError);
        });
    });

});
