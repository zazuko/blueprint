import { SparqlResultTerm } from "@blueprint/service/sparql/model/sparql-result-json";

export interface DashLiteralViewerData {
    label: string;
    literal: SparqlResultTerm[];
}
