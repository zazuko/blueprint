
import { shacl } from '@blueprint/ontology';
import rdfEnvironment from '@zazuko/env';

import { Parser } from 'n3';

import { IncomingPathFactory } from './incoming-path-factory';

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


const listPathOneTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path (ex:prop1) ;
    ] 
.`;


const listPathThreeTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path (ex:prop1 ex:prop2 ex:prop3) ;
    ] 
.`;


const listPathMoreInverseTtl = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:SimpleNodeShape a sh:NodeShape ;
    sh:property [
        sh:path (ex:prop1 [sh:inversePath ex:prop2] ex:prop3) ;
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

describe('IncomingPathFactory', () => {


    beforeEach(() => {

    });

    it('IncomingPathFactory :should transform to SPARQL with a simple path', () => {
        const factory = new IncomingPathFactory();
        const simpleNodePathDataset = rdfEnvironment.dataset(parser.parse(simplePathTtl));
        const pathGraph = rdfEnvironment.clownface({ dataset: simpleNodePathDataset }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('^<http://example.org/prop1>');
            const expectedOutput = ['^<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });
    it('IncomingPathFactory: should transform to SPARQL with an inverse path', () => {
        const factory = new IncomingPathFactory();

        const inverseNodePathDataset = rdfEnvironment.dataset(parser.parse(inversePathTtl));

        const pathGraph = rdfEnvironment.clownface({ dataset: inverseNodePathDataset }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('<http://example.org/prop1>');
            const expectedOutput = ['<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });
    });

    it('IncomingPathFactory: should transform to SPARQL with a list of one ', () => {
        const factory = new IncomingPathFactory();
        const ds = rdfEnvironment.dataset(parser.parse(listPathOneTtl));
        const pathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('^<http://example.org/prop1>');
            const expectedOutput = ['^<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('IncomingPathFactory: should transform to SPARQL with a list of three', () => {
        const factory = new IncomingPathFactory();
        const ds = rdfEnvironment.dataset(parser.parse(listPathThreeTtl));
        const pathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            const expectedOutput = ['^<http://example.org/prop1>', '^<http://example.org/prop2>', '^<http://example.org/prop3>'].reverse();
            expect(l.toPropertyPath()).toBe(expectedOutput.join('/'));
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('IncomingPathFactory: should transform to SPARQL with a list of three with inverse', () => {
        const factory = new IncomingPathFactory();
        const ds = rdfEnvironment.dataset(parser.parse(listPathMoreInverseTtl));
        const pathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            const expectedOutput = ['^<http://example.org/prop1>', '<http://example.org/prop2>', '^<http://example.org/prop3>'].reverse();
            expect(l.toPropertyPath()).toBe(expectedOutput.join('/'));
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('IncomingPathFactory: should throw an Exception, when applied to a literal path', () => {
        const factory = new IncomingPathFactory();
        const ds = rdfEnvironment.dataset(parser.parse(literalPathTtl));
        const pathGraph = rdfEnvironment.clownface({ dataset: ds }).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            expect(() => factory.createPath(path)).toThrowError(TypeError);
        });
    });


});
