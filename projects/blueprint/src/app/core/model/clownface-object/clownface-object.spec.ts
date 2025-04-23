import { GraphPointer } from 'clownface';
import { rdfEnvironment } from '../../rdf/rdf-environment';
import { ClownfaceObject } from './clownface-object';

const quads = [
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object2')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object2')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object2')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate3'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject3')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject2'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate3'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject4')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject3'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate3'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object2')),
    rdfEnvironment.quad(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject4'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate3'), rdfEnvironment.namedNode('http://examplrdfEnvironment.com/object3')),
];

const dataset = rdfEnvironment.dataset().addAll(quads);


describe('ClownfaceObject', () => {
    it('should get predicates for node', () => {
        const cfGraphSubject1 = rdfEnvironment.clownface(dataset, rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject')) as GraphPointer;

        expect(ClownfaceObject.getPredicatesForNode(cfGraphSubject1).length).toBe(2);
    });
    it('should follow a path and get the right number of predicates', () => {
        const cfGraphSubject2 = rdfEnvironment.clownface(dataset, rdfEnvironment.namedNode('http://examplrdfEnvironment.com/subject2')).out(rdfEnvironment.namedNode('http://examplrdfEnvironment.com/predicate3'));

        cfGraphSubject2.forEach(node => {
            expect(ClownfaceObject.getPredicatesForNode(node).length).toBe(1);
        });
    });
});   