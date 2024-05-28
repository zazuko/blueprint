import { ClownfaceObject } from './clownface-object';
import e from '@zazuko/env';

const quads = [
    e.quad(e.namedNode('http://example.com/subject'), e.namedNode('http://example.com/predicate'), e.namedNode('http://example.com/object')),
    e.quad(e.namedNode('http://example.com/subject'), e.namedNode('http://example.com/predicate'), e.namedNode('http://example.com/object2')),
    e.quad(e.namedNode('http://example.com/subject'), e.namedNode('http://example.com/predicate2'), e.namedNode('http://example.com/object')),
    e.quad(e.namedNode('http://example.com/subject'), e.namedNode('http://example.com/predicate2'), e.namedNode('http://example.com/object2')),
    e.quad(e.namedNode('http://example.com/subject2'), e.namedNode('http://example.com/predicate'), e.namedNode('http://example.com/object')),
    e.quad(e.namedNode('http://example.com/subject2'), e.namedNode('http://example.com/predicate'), e.namedNode('http://example.com/object2')),
    e.quad(e.namedNode('http://example.com/subject2'), e.namedNode('http://example.com/predicate2'), e.namedNode('http://example.com/object')),
    e.quad(e.namedNode('http://example.com/subject2'), e.namedNode('http://example.com/predicate3'), e.namedNode('http://example.com/subject3')),
    e.quad(e.namedNode('http://example.com/subject2'), e.namedNode('http://example.com/predicate3'), e.namedNode('http://example.com/subject4')),
    e.quad(e.namedNode('http://example.com/subject3'), e.namedNode('http://example.com/predicate3'), e.namedNode('http://example.com/object2')),
    e.quad(e.namedNode('http://example.com/subject4'), e.namedNode('http://example.com/predicate3'), e.namedNode('http://example.com/object3')),
];

const dataset = e.dataset(quads);


describe('ClownfaceObject', () => {
    it('should get predicates for node', () => {
        const cfGraphSubject1 = e.clownface({ dataset, term: e.namedNode('http://example.com/subject') });

        expect(ClownfaceObject.getPredicatesForNode(cfGraphSubject1).length).toBe(2);
    });
    it('should follow a path and get the right number of predicates', () => {
        const cfGraphSubject2 = e.clownface({ dataset, term: e.namedNode('http://example.com/subject2') }).out(e.namedNode('http://example.com/predicate3'));

        cfGraphSubject2.forEach(node => {
            expect(ClownfaceObject.getPredicatesForNode(node).length).toBe(1);
        });
    });
});   