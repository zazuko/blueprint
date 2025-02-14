import { Injectable, inject } from '@angular/core';

import { Observable, Subject, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import rdfEnvironment from '@zazuko/env';
import { Dataset } from '@rdfjs/types';

import { SearchQueryParam } from '../../model/search-query-param.model';
import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { searchQueryWithoutSearchTerm } from './util/search-without-search-term';
import { SearchContext } from './model/search-context.class';
import { StardogFullTextSearch } from './full-text-search/stardog-full-text-search/stardog-full-text-search.class';
import { FusekiFullTextSearch } from './full-text-search/fuseki-full-text-search/fuseki-full-text-search.class';
import { NeptuneFullTextSearch } from './full-text-search/neptune-full-text-search/neptune-full-text-search.class';
import { GraphDBFullTextSearch } from './full-text-search/graphdb-full-text-search/graphdb-full-text-search.class';
import { QleverFullTextSearch } from './full-text-search/qlever-full-text-search/qlever-full-text-search.class';


import { blueprint, rdf } from '@blueprint/ontology';

import { FullTextSearchDialect, SparqlService } from '@blueprint/service/sparql/sparql.service';
import { sparqlUtils } from '@blueprint/utils';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';
import { UiClassCount } from '@blueprint/model/ui-class-count/ui-class-count';
import { SearchResult } from '@blueprint/model/search-result/search-result';

@Injectable({
  providedIn: 'root',
})
export class SearchService {

  private readonly uiClassMetadataService = inject(UiClassMetadataService);
  private readonly sparqlService = inject(SparqlService);

  private readonly pageSize = 48;
  private searchContext: SearchContext | null = null;


  public searchResult$ = new Subject<SearchResultItem[]>;
  public totalCount$ = new Subject<number>();
  public classCount$ = new Subject<UiClassCount[]>();

  private _searchSubscription: Subscription | null = null;

  public search(searchParams: SearchQueryParam): void {
    this.searchContext = new SearchContext(searchParams);
    if (this._searchSubscription) {
      this._searchSubscription.unsubscribe();
    }
    this._searchSubscription = this.page(searchParams.page).pipe(
      map(dataset => {
        const resultGraph = rdfEnvironment.clownface({ dataset });
        const searchResultIris = resultGraph.node(blueprint.UiSearchResultNamedNode).in(rdf.typeNamedNode).values;
        if (searchResultIris.length === 0) {
          console.warn(`Invalid data: SearchResult.query is undefined`);
          return [];
        }

        if (searchResultIris.length > 1) {
          console.warn(`Invalid data: SearchResult.query has more than one value. Using first value`);
        }
        const searchResult = new SearchResult(resultGraph.namedNode(searchResultIris[0]));

        if (searchParams.page === 0) {
          this.totalCount$.next(searchResult.total);
          const classCounts = rdfEnvironment.clownface({ dataset }).node(blueprint.UiClassCountNamedNode).in(rdf.typeNamedNode).map(classCountNode => new UiClassCount(classCountNode));
          this.classCount$.next(classCounts);
        }

        const resultItems = searchResult.result.sort((a, b) => {
          return b.score - a.score;
        });
        return resultItems;
      })).subscribe({
        next: searchResult => {
          this.searchResult$.next(searchResult);
        },
        error: error => {
          console.error('SearchService.search', error);
          this._searchSubscription = null;
        },
        complete: () => {
          this._searchSubscription = null;
        }
      })
      ;

  }


  public newSearch(searchParams: SearchQueryParam): Observable<Dataset> {
    this.searchContext = new SearchContext(searchParams);
    return this.page(0);
  }

  /**
   * Fetch a new page for this search
   * 
   * @param pageNumber new page to fetch
   * @returns Observable<Dataset> with the dataset containing the new results
   */
  public page(pageNumber: number): Observable<Dataset> {
    const pageObservable = this.uiClassMetadataService.getClassMetadata()
      .pipe(
        map(classMetadataArray => {
          // filter active metadata instances
          return classMetadataArray.filter(classMetadata => this._isActiveFilter(classMetadata));
        }),
        switchMap(filteredClassMetadata => {
          // create full text search provider
          console.log('fullTextSearchDialect', this.sparqlService.fullTextSearchDialect);

          let ftsProvider: FusekiFullTextSearch | StardogFullTextSearch | NeptuneFullTextSearch | GraphDBFullTextSearch | QleverFullTextSearch;

          switch (this.sparqlService.fullTextSearchDialect) {
            case FullTextSearchDialect.QLEVER:
              ftsProvider = new QleverFullTextSearch(this.searchContext);
              break;
            case FullTextSearchDialect.FUSEKI:
              ftsProvider = new FusekiFullTextSearch(this.searchContext);
              break;
            case FullTextSearchDialect.NEPTUNE:
              ftsProvider = new NeptuneFullTextSearch(this.searchContext);
              break;
            case FullTextSearchDialect.GRAPHDB:
              ftsProvider = new GraphDBFullTextSearch(this.searchContext);
              break;
            default:
              ftsProvider = new StardogFullTextSearch(this.searchContext);
              break;
          }

          // log what kind of ftsProvider is used
          console.log('ftsProvider', ftsProvider);

          // build queries
          // it includes the following queries:
          // - class metadata query
          // - count total query
          // - count query
          // - search query
          const queries: string[] = [];
          // metadata query
          queries.push(this.uiClassMetadataService.getClassMetadataSparqlQuery())
          // count total query and count query if needed
          if (pageNumber === 0) {
            queries.push(
              ftsProvider.totalCountQueryWithSearchTerm(filteredClassMetadata)
            );
            queries.push(
              ftsProvider.classCountQueryWithSearchTerm(filteredClassMetadata)
            );
          }
          // search query
          if (this.searchContext.searchTerm.toString().length === 0) {
            // search without search term
            queries.push(searchQueryWithoutSearchTerm(filteredClassMetadata, pageNumber, this.pageSize));

            const mergedQuery = sparqlUtils.mergeConstruct(queries);
            const commentedQuery = `# Search Query - Search without term, page: ${pageNumber}, pageSize: ${this.pageSize}\n${mergedQuery}`;
            return this.sparqlService.construct(commentedQuery);
          }
          // search with search term
          const textSearchQuery = ftsProvider.searchQueryWithSearchTerm(filteredClassMetadata, pageNumber, this.pageSize);
          queries.push(textSearchQuery);

          const mergedQuery = sparqlUtils.mergeConstruct(queries);
          const commentedQuery = `# Search Query - term: ${this.searchContext.searchTerm.toString()}, page: ${pageNumber}, pageSize: ${this.pageSize}\n${mergedQuery}`;

          return this.sparqlService.construct(commentedQuery);
        })
      );

    return pageObservable;
  }

  private _isActiveFilter(classMetadata: UiClassMetadata): boolean {
    const filters = this.searchContext.filterIris;
    if (filters.length === 0) {
      return true;
    }
    if (filters.indexOf(classMetadata.targetNode.value) > -1) {
      return true;
    }
    return false;
  }
}
