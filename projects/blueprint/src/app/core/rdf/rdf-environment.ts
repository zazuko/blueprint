import { NamespaceBuilder } from '@rdfjs/namespace';
import RdfTypes from '@rdfjs/types';
import env from '@zazuko/env/web';

export type { RdfTypes };
export type { NamespaceBuilder };
import { Parser, Writer } from 'n3';




class RdfEnvironment {
    #rdfEnv = env;

    parseTurtle(turtle: string): RdfTypes.Dataset {
        const parser = new Parser();
        const quads = parser.parse(turtle);
        const dataset = this.#rdfEnv.dataset(quads);
        return dataset as unknown as RdfTypes.Dataset;
    }

    dataset(): RdfTypes.Dataset {
        return this.#rdfEnv.dataset() as unknown as RdfTypes.Dataset;
    }

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

    namedNode(iri: string): RdfTypes.NamedNode {
        return this.#rdfEnv.namedNode(iri);
    }

    blankNode(value: string): RdfTypes.BlankNode {
        return this.#rdfEnv.blankNode(value);
    }

    namespace(prefix: string): NamespaceBuilder<string> {
        return this.#rdfEnv.namespace<string>(prefix);
    }

    variable(variable: string): RdfTypes.Variable {
        return this.#rdfEnv.variable(variable);
    }

    quad(subject: RdfTypes.Quad_Subject, predicate: RdfTypes.Quad_Predicate, object: RdfTypes.Quad_Object, graph?: RdfTypes.Quad_Graph): RdfTypes.Quad {
        return this.#rdfEnv.quad(subject, predicate, object, graph);
    }

    literal(value: string, languageOrDatatype?: string | RdfTypes.NamedNode): RdfTypes.Literal {
        return this.#rdfEnv.literal(value, languageOrDatatype);
    }

}

export const rdfEnvironment = new RdfEnvironment();