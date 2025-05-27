import { NamespaceBuilder } from '@rdfjs/namespace';
import RdfTypes from '@rdfjs/types';
import env from '@zazuko/env/web';

export type { RdfTypes };
export type { NamespaceBuilder };
import { Parser, Writer } from 'n3';

import { shrink } from '@zazuko/prefixes/shrink';
import prefixes from '@zazuko/prefixes/prefixes';

class RdfEnvironment {
    #rdfEnv = env;

    /**
     * Parse a Turtle string into a dataset.
     * 
     * @param turtle - The Turtle string to parse.
     * @returns a dataset containing the parsed quads.
     */
    parseTurtle(turtle: string): RdfTypes.Dataset {
        const parser = new Parser();
        const quads = parser.parse(turtle);
        const dataset = this.#rdfEnv.dataset(quads);
        return dataset as unknown as RdfTypes.Dataset;
    }

    /**
     * Create a new empty dataset.
     * 
     * @returns a new empty dataset.
     */
    dataset(): RdfTypes.Dataset {
        return this.#rdfEnv.dataset() as unknown as RdfTypes.Dataset;
    }

    /**
     * Create a Clownface instance for the given dataset and optional term.
     * 
     * @param dataset - The dataset to create the Clownface instance for.
     * @param term - The optional term to create the Clownface instance for.
     * @returns a Clownface instance.
     */
    clownface(dataset: RdfTypes.Dataset, term?: RdfTypes.Term) {
        if (term) {
            return this.#rdfEnv.clownface({ dataset, term });
        }
        return this.#rdfEnv.clownface({ dataset });
    }

    /**
     * Serialize the dataset to a string in Turtle format if it contains only the default graph,
     * otherwise serialize it to TriG format.
     * 
     * @param dataset - The dataset to serialize.
     * @returns The serialized dataset as a string.
     * @throws An error if the serialization fails.
     */
    serialize(dataset: RdfTypes.Dataset): string | never {
        const writer = new Writer();
        dataset.forEach(quad => writer.addQuad(quad));
        let rdfString = '';
        writer.end((error, result) => {
            if (error) {
                throw new Error(`Error serializing dataset: ${error.message}`);
            }
            rdfString = result;
        });
        return rdfString;
    }
    /**
     * Create a named node for the given IRI.
     * 
     * @param iri - The IRI to create a named node for.
     * @returns 
     */
    namedNode(iri: string): RdfTypes.NamedNode {
        return this.#rdfEnv.namedNode(iri);
    }

    /**
     * Create a blank node with the given value.
     * 
     * @param value - The value of the blank node.
     * @returns 
     */
    blankNode(value: string): RdfTypes.BlankNode {
        return this.#rdfEnv.blankNode(value);
    }

    /**
     * Create a namespace builder for the given prefix.
     * 
     * @param prefix - The prefix to create a namespace builder for.
     * @returns 
     */
    namespace(prefix: string): NamespaceBuilder<string> {
        return this.#rdfEnv.namespace<string>(prefix);
    }

    /**
     * Create a variable with the given name.
     * 
     * @param variable - The name of the variable.
     * @returns 
     */
    variable(variable: string): RdfTypes.Variable {
        return this.#rdfEnv.variable(variable);
    }

    /**
     * Create a quad with the given subject, predicate, object, and optional graph.
     * 
     * @param subject - The subject of the quad.
     * @param predicate - The predicate of the quad.
     * @param object - The object of the quad.
     * @param graph - The optional graph of the quad.
     * @returns a new quad.
     */
    quad(subject: RdfTypes.Quad_Subject, predicate: RdfTypes.Quad_Predicate, object: RdfTypes.Quad_Object, graph?: RdfTypes.Quad_Graph): RdfTypes.Quad {
        return this.#rdfEnv.quad(subject, predicate, object, graph);
    }

    /**
     * Create a literal with the given value and optional language or datatype.
     * 
     * @param value - The value of the literal.
     * @param languageOrDatatype - The optional language or datatype of the literal.
     * @returns a new literal.
     */
    literal(value: string, languageOrDatatype?: string | RdfTypes.NamedNode): RdfTypes.Literal {
        return this.#rdfEnv.literal(value, languageOrDatatype);
    }

    /**
     * Shrink the given term to its prefixed form if possible.
     * 
     * @param term - The term to shrink.
     * @returns The shrunk term as a string.
     */
    shrinkTerm(term: RdfTypes.Term): string {
        return shrink(term.value)
    }

    /**
     * Shrink the given IRI to its prefixed form if possible.
     * 
     * Valid IRIs can be in the form of:
     * - `<http://example.org/resource>`
     * - `http://example.org/resource`
     * 
     * @param iri - The IRI to shrink.
     * @returns The shrunk IRI as a string.
     */
    shrink(iri: string): string {
        if (iri.startsWith('<')) {
            const iriWithoutBrackets = iri.slice(1, -1);
            const shrinked = shrink(iriWithoutBrackets, prefixes);
            if (!shrinked) {
                return iri;
            }
            return shrinked;
        }
        const shrinked = shrink(iri, prefixes);
        if (!shrinked) {
            return iri;
        }
        return shrinked;
    }


}

export const rdfEnvironment = new RdfEnvironment();