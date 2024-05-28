export interface DatabaseColumnSettings {
    label: string;
    isKey?: boolean;
    isPrimaryKey?: boolean;
}

export interface DatabaseColumn {
    iri: string
    label: string;
    type: string;
    settings: DatabaseColumnSettings[];
    references: DatabaseReference[];
}

export interface DatabaseReference {
    isIncoming: boolean;
    table: string;
    tableIri: string;
    column: string;
}

export interface DatabaseTable {
    iri: string;
    label: string;
    columns: DatabaseColumn[];
}