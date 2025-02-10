
export interface Widget {
    id: string;
    label: string;
    componentIri: string;
    data: unknown;
    rowSpan?: number;
    columnSpan?: number;
}
