import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { NamedNode } from "@rdfjs/types";
import { GraphPointer } from "clownface";
import { Widget } from "../widget/model/widget.model";
import { blueprint, rdf, rdfs, shacl } from "@blueprint/ontology";

export class Dashboard extends ClownfaceObject {

    target: NamedNode;

    #widgets: RdfWidget[] | undefined;

    constructor(node: GraphPointer) {
        super(node);
    }

    get widgets(): RdfWidget[] {
        if (this.#widgets === undefined) {
            this.#widgets = this._node.out(blueprint.hasWidgetNamedNode).map(n => new RdfWidget(n));
        }
        return this.#widgets;
    }

}

/**
 * Represents an RDF widget.
 * 
 * @implements {Widget}
 */
class RdfWidget extends ClownfaceObject implements Widget {
    #label: string | undefined;
    #componentIri: string | undefined = undefined;
    #rowSpan: number | undefined = undefined;
    #columnSpan: number | undefined = undefined;
    #index: number | undefined = undefined;
    #sparqlQueryTemplate: string | undefined = undefined;
    #data: GraphPointer | null | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
    }

    get data(): GraphPointer | null {
        if (this.#data === undefined) {
            const dataNodes = this._node.out(blueprint.resultNamedNode);
            if (dataNodes.values.length === 0) {
                this.#data = null;
            } else {
                this.#data = dataNodes.toArray()[0];
            }
        }
        return this.#data;
    }

    get id(): string {
        return this._node.value;
    }

    get label(): string {
        if (!this.#label === undefined) {
            const labels = this._node.out(rdfs.labelNamedNode).values;
            labels.length > 0 ? this.#label = labels.join(', ') : this.#label = '';
        }
        return this.#label;
    }

    get componentIri(): string {
        if (this.#componentIri === undefined) {
            const component = this._node.out(blueprint.hasComponentNamedNode).values;
            if (component.length === 0) {
                throw new Error(`No component defined for widget ${this._node.value}`);
            }
            this.#componentIri = component[0];
        }
        return this.#componentIri;

    }

    get rowSpan(): number {
        if (this.#rowSpan === undefined) {
            const rowString = this._node.out(blueprint.hasRowSpanNamedNode).value;
            if (rowString === undefined) {
                this.#rowSpan = 1;
            } else {
                const row = Number(rowString);
                isNaN(row) ? this.#rowSpan = 1 : this.#rowSpan = row;
            }
        }
        return this.#rowSpan;
    }

    get columnSpan(): number {
        if (this.#columnSpan === undefined) {
            const columnString = this._node.out(blueprint.hasColumnSpanNamedNode).value;
            if (columnString === undefined) {
                this.#columnSpan = 1;
            } else {
                const column = Number(columnString);
                isNaN(column) ? this.#columnSpan = 1 : this.#columnSpan = column;
            }
        }
        return this.#columnSpan;
    }

    get sparqlQueryTemplate(): string {
        if (this.#sparqlQueryTemplate === undefined) {
            const query = this._node.out(blueprint.hasSparqlQueryTemplateNamedNode).values;
            if (query.length === 0) {
                throw new Error(`No SPARQL query template defined for widget ${this._node.value}`);
            }

            this.#sparqlQueryTemplate = query[0];
        }
        return this.#sparqlQueryTemplate;
    }



    createQueryForInstance(instance: NamedNode): string {
        const resultIri = `${this._node.value}/${this.index}`;
        const result = `<${this._node.value}> ${blueprint.resultPrefixed} <${resultIri}> .\n\t<${resultIri}>`;
        const query = this.sparqlQueryTemplate.replaceAll('??subject', `<${instance.value}>`).replaceAll('??result', result);
        const prefix = `${shacl.sparqlPrefix()}\n${blueprint.sparqlPrefix()}\n${rdfs.sparqlPrefix()}\n${rdf.sparqlPrefix()}\n`;
        return prefix + query;
    }

    get index(): number {
        if (this.#index === undefined) {
            const indexString = this._node.out(blueprint.indexNamedNode).values;
            if (indexString.length === 0) {
                throw new Error(`No Index defined for widget ${this._node.value}`);
            } else {
                const index = Number(indexString[0]);
                if (isNaN(index)) {
                    throw new Error(`Invalid Index defined for widget ${this._node.value}`);
                }
                this.#index = index;
            }
        }
        return this.#index;
    }


}
