import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { NodeElement } from "@blueprint/model/node-element/node-element.class";
import { blueprint, rdfs } from "@blueprint/ontology";
import { GraphPointer } from "clownface";




export class CompositionLinkResult extends ClownfaceObject {
    private _label: string | null = null;
    private _result: CompositionNodeElement[] | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    get label(): string {
        if (this._label === null) {
            this._label = this._node.out(rdfs.labelNamedNode).value ?? '';
        }
        return this._label;
    }


    get result(): CompositionNodeElement[] {
        if (this._result === null) {
            this._result = this._node.out(blueprint.resultNamedNode).map(n => new CompositionNodeElement(n));
        }
        return this._result;
    }

}

export class CompositionNodeElement extends NodeElement {

    private _connections: Connection[] | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }



    get connections(): Connection[] {
        if (this._connections === null) {
            const sourceConnectionPoints = this._node.out(blueprint.sourceNamedNode);
            if (sourceConnectionPoints.values.length === 0) {
                const targetConnectionPoints = this._node.out(blueprint.targetNamedNode).map(n => new NodeElement(n));
                this._connections = targetConnectionPoints.map(target => {
                    return {
                        source: null,
                        target: target
                    };
                }
                );
            } else {
                this._connections = sourceConnectionPoints.toArray().flatMap(sourcePoint => {

                    const conns = sourcePoint.map((sourceConnector) => {
                        const connections: Connection[] = [];
                        sourceConnector.out(blueprint.targetNamedNode).forEach((targetConnector) => {
                            connections.push({
                                source: new NodeElement(sourceConnector),
                                target: new NodeElement(targetConnector)
                            });
                        });
                        if (connections.length === 0) {
                            connections.push({
                                source: new NodeElement(sourceConnector),
                                target: null
                            });
                        }
                        return connections;
                    });
                    return conns.flat();
                });
            }
        }
        return this._connections;
    }


}


interface Connection {
    source: NodeElement | null;
    target: NodeElement | null;
}



