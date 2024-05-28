import { SearchFilter } from './search-filter.model';

export interface SearchQueryParam {
    term: string;
    filter: SearchFilter[];
    page?: number;
    size?: number;
}
