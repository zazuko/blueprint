import { UiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import { SearchContext } from "../model/search-context.class";


export abstract class FullTextSearch {
    protected _searchContext: SearchContext;

    public constructor(searchContext: SearchContext) {
        this._searchContext = searchContext;
    }

    abstract searchQueryWithSearchTerm(metadata: UiClassMetadata[], pageNumber: number, pageSize: number): string;
    abstract classCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string;
    abstract totalCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string;
}