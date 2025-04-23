
import { shacl } from '@blueprint/ontology';


import { OutgoingPathFactory } from './outgoing-path-factory';
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

describe('OutgoingPathFactory', () => {


    beforeEach(() => {

    });

    it('OutgoingPathFactory :should transform to SPARQL with a simple path', () => {
        const factory = new OutgoingPathFactory();
        const simpleNodePathDataset = rdfEnvironment.parseTurtle(simplePathTtl);
        const pathGraph = rdfEnvironment.clownface(simpleNodePathDataset).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('<http://example.org/prop1>');
            const expectedOutput = ['<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });
    it('OutgoingPathFactory: should transform to SPARQL with an inverse path', () => {
        const factory = new OutgoingPathFactory();

        const inverseNodePathDataset = rdfEnvironment.parseTurtle(inversePathTtl);

        const pathGraph = rdfEnvironment.clownface(inverseNodePathDataset).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('^<http://example.org/prop1>');
            const expectedOutput = ['^<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });
    });

    it('OutgoingPathFactory: should transform to SPARQL with a list of one ', () => {
        const factory = new OutgoingPathFactory();
        const ds = rdfEnvironment.parseTurtle(listPathOneTtl);
        const pathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('<http://example.org/prop1>');
            const expectedOutput = ['<http://example.org/prop1>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('OutgoingPathFactory: should transform to SPARQL with a list of three', () => {
        const factory = new OutgoingPathFactory();
        const ds = rdfEnvironment.parseTurtle(listPathThreeTtl);
        const pathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('<http://example.org/prop1>/<http://example.org/prop2>/<http://example.org/prop3>');
            const expectedOutput = ['<http://example.org/prop1>', '<http://example.org/prop2>', '<http://example.org/prop3>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('OutgoingPathFactory: should transform to SPARQL with a list of three with inverse', () => {
        const factory = new OutgoingPathFactory();
        const ds = rdfEnvironment.parseTurtle(listPathMoreInverseTtl);
        const pathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            const l = factory.createPath(path);
            expect(l.toPropertyPath()).toBe('<http://example.org/prop1>/^<http://example.org/prop2>/<http://example.org/prop3>');
            const expectedOutput = ['<http://example.org/prop1>', '^<http://example.org/prop2>', '<http://example.org/prop3>'];
            expect(l.toPathFragments()).toEqual(expectedOutput);
        });

    });

    it('OutgoingPathFactory: should throw an Exception, when applied to a literal path', () => {
        const factory = new OutgoingPathFactory();
        const ds = rdfEnvironment.parseTurtle(literalPathTtl);
        const pathGraph = rdfEnvironment.clownface(ds).out(shacl.pathNamedNode);
        pathGraph.forEach(path => {
            expect(() => factory.createPath(path)).toThrowError(TypeError);
        });
    });


});
