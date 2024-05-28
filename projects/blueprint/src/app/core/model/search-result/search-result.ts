import { ClownfaceObject } from '../clownface-object/clownface-object';
import { GraphPointer } from 'clownface';
import { SearchResultItem } from '../search-result-item/search-result-item';

import { blueprint } from '@blueprint/ontology';

/**
 * SearchResult Class
 * This is the structure of a search result
 */
export class SearchResult extends ClownfaceObject {

    private _result: SearchResultItem[] | null = null;
    private _pageSize: number | null = null;
    private _pageNumber: number | null = null;
    private _total: number | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The search result
     * 
     * @readonly
     * @link blueprint:result
     */
    public get result(): SearchResultItem[] {
        if (this._result === null) {
            const results = this._node.out(blueprint.resultNamedNode);
            this._result = results.map(result => new SearchResultItem(result));
        }
        return this._result;
    }

    /**
     * The page Size
     * 
     * @readonly
     * @link blueprint:pageSize
     */
    public get pageSize(): number {
        if (this._pageSize === null) {
            const pageSizes = this._node.out(blueprint.pageSizeNamedNode).values;
            if (pageSizes.length === 0) {
                console.warn(`Invalid data: SearchResult.pageSize is undefined. Using default value of 0`);
                this._pageSize = 0;
                return this._pageSize;
            } else if (pageSizes.length > 1) {
                console.warn(`Invalid data: SearchResult.pageSize has more than one value. Using first value`);
            }
            const number = Number(pageSizes[0]);
            if (isNaN(number)) {
                console.warn(`Invalid data: SearchResult.pageSize is not a number. Current value ${pageSizes[0]}. Using default value of 0`);
                this._pageSize = 0;
                return this._pageSize;
            }
            this._pageSize = number;
        }
        return this._pageSize
    }

    /**
     * Page number
     * 
     * @readonly
     * @link blueprint:pageNumber
     */
    public get pageNumber(): number {
        if (this._pageNumber === null) {
            const pageNumbers = this._node.out(blueprint.pageNumberNamedNode).values;
            if (pageNumbers.length === 0) {
                console.warn(`Invalid data: SearchResult.pageNumber is undefined. Using default value of 0`);
                this._pageNumber = 0;
                return this._pageNumber;
            } else if (pageNumbers.length > 1) {
                console.warn(`Invalid data: SearchResult.pageNumber has more than one value. Using first value`);
            }
            const number = Number(pageNumbers[0]);
            if (isNaN(number)) {
                console.warn(`Invalid data: SearchResult.pageNumber is not a number. Current value ${pageNumbers[0]}. Using default value of 0`);
                this._pageNumber = 0;
                return this._pageNumber;
            }
            this._pageNumber = number;
        }
        return this._pageNumber
    }

    /**
     * The total of search results
     * 
     * @readonly
     * @link blueprint:total
     */
    public get total(): number {
        if (this._total === null) {
            const totals = this._node.out(blueprint.totalNamedNode).values;
            if (totals.length === 0) {
                console.warn(`Invalid data: SearchResult.total is undefined. Using default value of 0`);
                this._total = 0;
                return this._total;
            } else if (totals.length > 1) {
                console.warn(`Invalid data: SearchResult.total has more than one value. Using first value`);
            }
            const number = Number(totals[0]);
            if (isNaN(number)) {
                console.warn(`Invalid data: SearchResult.total is not a number. Current value ${totals[0]}. Using default value of 0`);
                this._total = 0;
                return this._total;
            }
            this._total = number;
        }
        return this._total;
    }

}
