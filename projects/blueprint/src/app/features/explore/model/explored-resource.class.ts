import { DEFAULT_COLOR } from "@blueprint/constant/color";
import { DEFAULT_ICON } from "@blueprint/constant/icon";
import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { RdfUiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import { rdf, rdfs, shacl, skos } from "@blueprint/ontology";
import { GraphPointer } from "clownface";
import { rdfEnvironment, RdfTypes } from "../../../core/rdf/rdf-environment";
import { Avatar } from "../../../shared/component/ui/avatar/avatar.component";
import { NodeElement } from "@blueprint/model/node-element/node-element.class";
import { sortLiteralsByBrowserLanguage } from "../../../core/utils/language-prededence";


export class ExploredResource extends ClownfaceObject {

    #title: string | undefined = undefined;
    #avatars: Avatar[] | undefined = undefined;
    #classLabel: string | undefined = undefined;
    #rdfTypeIri: string[] | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    get rdfTypeIri(): string[] {
        if (this.#rdfTypeIri === null) {
            this.#rdfTypeIri = this._node.out(rdf.typeNamedNode).values;
        }
        return this.#rdfTypeIri;
    }

    /**
     * Get the title of the resource. It will try to get the title from the following predicates in order:
     * - skos:prefLabel
     * - rdfs:label
     * - schema:name
     * - the resource IRI
     * 
     * Then it is ordered by the language tag. We find a label with the language tag "en" first. This my be not 
     * the best solution, but it is the best we can do for now.
     */
    get title(): string {
        if (this.#title === undefined) {
            this.#title = ClownfaceObject.getLabelForNode(this._node);
        }
        return this.#title;
    }

    /**
     * Get the avatars of the resource.
     */
    get avatars(): Avatar[] {
        if (this.#avatars === undefined) {
            const metaGraph = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode);
            let avatarArray: Avatar[] = metaGraph.map((metaData) => {
                const uiClassMetaData = new RdfUiClassMetadata(metaData);
                const icon = uiClassMetaData.icon;
                const color = uiClassMetaData.color;
                const label = uiClassMetaData.label;
                return { label, icon, color };
            });
            if (avatarArray.length === 0) {
                avatarArray = [
                    {
                        label: this._node.out(rdf.typeNamedNode).values.join(', '),
                        icon: DEFAULT_ICON,
                        color: DEFAULT_COLOR
                    }
                ];
            }
            this.#avatars = avatarArray;
        }
        return this.#avatars;
    }

    /**
     * Get the class label of the resource.
     * 
     * @todo: this should be part of the avatar
     */
    get classLabel(): string {
        if (this.#classLabel === undefined) {
            const metaGraph = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode);
            let classLabel = metaGraph.out(rdfs.labelNamedNode).values.join(', ');
            if (classLabel.length === 0) {
                classLabel = this._node.out(rdf.typeNamedNode).map((type) => rdfEnvironment.shrinkTerm(type.term)).join(', ');
            }
            this.#classLabel = classLabel;
        }
        return this.#classLabel;
    }

    /**
     * Get all predicates for the resource where the object is a literal.
     * 
     * @returns An array of literal predicates for the resource. This is done by getting all the quads for the resource and filtering
     */
    getLiteralTripleMap(): Map<string, RdfTypes.Quad[]> {
        const quads = [...this._node.dataset.match(this._node.term, null, null)];
        const literalQuads = quads.filter(quad => quad.object.termType === 'Literal');
        // create a map with predicate as key and then the quads as array
        const literalPredicateMap = new Map<string, RdfTypes.Quad[]>();
        literalQuads.forEach((quad) => {
            const key = quad.predicate.value;
            if (!literalPredicateMap.has(key)) {
                literalPredicateMap.set(key, []);
            }
            literalPredicateMap.get(key)?.push(quad);
        });
        return literalPredicateMap;
    }

    resolveLabelForPredicate(predicate: string): string {
        const predicatePtr = this._node.namedNode(predicate);
        const rdfsLabelTerms = predicatePtr.out(rdfs.labelNamedNode).terms as RdfTypes.Literal[];
        const skosPrefLabelTerms = predicatePtr.out(skos.prefLabelNamedNode).terms as RdfTypes.Literal[];
        const name = sortLiteralsByBrowserLanguage([...rdfsLabelTerms, ...skosPrefLabelTerms]);
        if (name.length > 0) {
            return name[0].value;
        }
        const predicateString = predicate.includes('#')
            ? predicate.split('#').pop()
            : predicate.split('/').pop();
        if (predicateString) {
            return predicateString.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
        return predicate;
    }

    blankNodeElements(): NodeElement[] {

        const blankNodeTerms = this._node.out().filter(term => term.term.termType === 'BlankNode');

        console.log('Blank Node Terms:', blankNodeTerms.map(term => term.term.value));
        return blankNodeTerms.map(term => {
            const blankNodeElement = new NodeElement(term);
            return blankNodeElement;
        });


    }




}

