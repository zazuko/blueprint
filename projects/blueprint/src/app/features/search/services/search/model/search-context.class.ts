import { SearchQueryParam } from "../../../model/search-query-param.model";

export class SearchContext {
    private _searchTerm: SafeSearchTerm;
    private _metadataIri: string[] = [];

    constructor(param: SearchQueryParam) {
        this._searchTerm = this._escapeString(param.term);
        this._metadataIri = param.filter.map(f => f.iri);
    }

    get filterIris(): string[] {
        return this._metadataIri;
    }

    /**
     * Getter searchTerm
     * @return {string} the escaped search term
     */
    get searchTerm(): SafeSearchTerm {
        return this._searchTerm;
    }


    private _escapeString(searchTerm: string): SafeSearchTerm {
        const escaped = searchTerm.replace(
            /([!*+&|()[\]{}^~?:"])/g,
            '\\$1');

        const removeHyphenForFuseki = escaped.replace(/-/g, ' ');
        return removeHyphenForFuseki as SafeSearchTerm;
    }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SafeValue {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SafeSearchTerm extends SafeValue {
}