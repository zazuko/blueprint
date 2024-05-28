interface SparqlResultBinding {
    [variableName: string]: SparqlResultTerm
}

export interface SparqlResultTerm {
    type: 'uri' | 'bnode' | 'literal';
    value: string;
    datatype?: string;
    lang?: string;
}

export interface SparqlResult {
    head: {
        vars: string[];
    };
    results: {
        bindings: SparqlResultBinding[];
    };
}

export function transformToRecords(result: SparqlResult): Record<string, SparqlResultTerm>[] {
    const records: Record<string, SparqlResultTerm>[] = [];

    for (const binding of result.results.bindings) {
        const record: Record<string, SparqlResultTerm> = {};

        for (const [key, value] of Object.entries(binding)) {
            record[key] = {
                type: value.type, // add the type property
                value: value.value,
                datatype: value.datatype || 'http://www.w3.org/2001/XMLSchema#string',
                lang: value.lang
            } as SparqlResultTerm; // assert that the object is of type Term
        }

        records.push(record);
    }

    return records;
}
