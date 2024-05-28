import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { GraphPointer } from "clownface";
import { ArchimateDiagramOntology, archimateDiagramOntology } from "./ontology";

export class ArchimateDataFlow extends ClownfaceObject {
    private _label: string | null = null;
    private _target: ArchimateApplication | null | undefined = undefined;
    private _source: ArchimateApplication | null | undefined = undefined;
    private _flowType: string | null = null;
    private _businessObjectsTransported: ArchimateBusinessObject[] | null = null;

    constructor(graph: GraphPointer, private ontology: ArchimateDiagramOntology = archimateDiagramOntology) {
        super(graph);
    }

    get label(): string {
        if (this._label === null) {
            const labels = this._node.out(this.ontology.label).values;
            if (labels.length > 1) {
                this._label = labels.join(', ');
            } else if (labels.length === 1) {
                this._label = labels[0];
            } else {
                this._label = '';
            }
        }
        return this._label;
    }

    get target(): ArchimateApplication | null {
        if (this._target === undefined) {
            const targets = this._node.out(this.ontology.target);
            if (targets.values.length === 0) {
                this._target = null;
            } else {
                if (targets.values.length > 1) {
                    console.warn(`DataFlow <${this.iri}> has more than one target. Using the first one.`);
                }
                this._target = new ArchimateApplication(targets.toArray()[0], this.ontology);
            }
        }
        return this._target;
    }

    get source(): ArchimateApplication | null {
        if (this._source === undefined) {
            const sources = this._node.out(this.ontology.source);
            if (sources.values.length === 0) {
                this._source = null;
            } else {
                if (sources.values.length > 1) {
                    console.warn(`DataFlow <${this.iri}> has more than one source. Using the first one.`);
                }
                this._source = new ArchimateApplication(sources.toArray()[0], this.ontology);
            }
        }
        return this._source;
    }

    get flowType(): string {
        if (this._flowType === null) {
            const flowTypes = this._node.out(this.ontology.flowType).values;
            if (flowTypes.length > 1) {
                console.warn(`DataFlow <${this.iri}> has more than one flow type. Joining them with a comma.`);
                this._flowType = flowTypes.join(', ');
            } else if (flowTypes.length === 1) {
                this._flowType = flowTypes[0];
            } else {
                this._flowType = '';
            }
        }
        return this._flowType;
    }

    get businessObjectsTransported(): ArchimateBusinessObject[] {
        if (this._businessObjectsTransported === null) {
            this._businessObjectsTransported = this._node.out(this.ontology.businessObjectsTransported).map(node => new ArchimateBusinessObject(node, this.ontology));
        }
        return this._businessObjectsTransported;
    }

}


export class ArchimateApplication extends ClownfaceObject {
    private _label: string | null = null;
    private _incomingDataFlows: ArchimateDataFlow[] | null = null;
    private _outgoingDataFlows: ArchimateDataFlow[] | null = null;

    constructor(graph: GraphPointer, private ontology: ArchimateDiagramOntology = archimateDiagramOntology) {
        super(graph);
    }

    get label(): string {
        if (this._label === null) {
            const labels = this._node.out(this.ontology.label).values;
            if (labels.length > 1) {
                this._label = labels.join(', ');
            } else if (labels.length === 1) {
                this._label = labels[0];
            } else {
                this._label = '';
            }
        }
        return this._label;
    }

    get incomingDataFlows(): ArchimateDataFlow[] {
        if (this._incomingDataFlows === null) {
            this._incomingDataFlows = this._node.in(this.ontology.target).map(node => new ArchimateDataFlow(node, this.ontology));
        }
        return this._incomingDataFlows;
    }

    get outgoingDataFlows(): ArchimateDataFlow[] {
        if (this._outgoingDataFlows === null) {
            this._outgoingDataFlows = this._node.in(this.ontology.source).map(node => new ArchimateDataFlow(node, this.ontology));
        }
        return this._outgoingDataFlows;
    }

}

export class ArchimateBusinessObject extends ClownfaceObject {
    private _label: string | null = null;

    constructor(graph: GraphPointer, private ontology: ArchimateDiagramOntology = archimateDiagramOntology) {
        super(graph);
    }

    get label(): string {
        if (this._label === null) {
            const labels = this._node.out(this.ontology.label).values;
            if (labels.length > 1) {
                this._label = labels.join(', ');
            } else if (labels.length === 1) {
                this._label = labels[0];
            } else {
                this._label = '';
            }
        }
        return this._label;
    }
}