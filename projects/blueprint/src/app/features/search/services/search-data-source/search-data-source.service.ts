import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { inject, Injectable } from '@angular/core';

import {
  BehaviorSubject,
  map,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';


import { SearchQueryParam } from '../../model/search-query-param.model';
import { SearchService } from '../search/search.service';

import { flux, rdf } from '@blueprint/ontology';
import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';
import { UiClassCount } from '@blueprint/model/ui-class-count/ui-class-count';
import { SearchResult } from '@blueprint/model/search-result/search-result';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

@Injectable({
  providedIn: 'root',
})
export class SearchDataSourceService extends DataSource<SearchResultItem> {
  public total = 0;

  private readonly pageSize = 50;

  private _searchParam: SearchQueryParam = null;
  private _cachedData: SearchResultItem[] = [];
  private _newSearch$ = new Subject<void>();
  private _fetchedPages = new Set<number>();
  private _dataStream = new BehaviorSubject<SearchResultItem[]>(this._cachedData);
  private _resultCountStream = new BehaviorSubject<number>(0);
  private _loadingStream = new BehaviorSubject<boolean>(false);
  private _classCountStream = new ReplaySubject<RdfTypes.Dataset>();
  private _subscription = new Subscription();

  readonly #searchService = inject(SearchService)
  constructor() {
    super();
  }

  get resultCount$(): Observable<number> {
    return this._resultCountStream.asObservable();
  }

  get classCount$(): Observable<UiClassCount[]> {
    return this._classCountStream.asObservable().pipe(
      map(dataset => {
        return rdfEnvironment.clownface(dataset).node(flux.UiClassCountNamedNode).in(rdf.typeNamedNode).map(classCountNode => new UiClassCount(classCountNode))
      })
    );
  }

  get loading$(): Observable<boolean> {
    return this._loadingStream.asObservable();
  }

  public newSearch(param: SearchQueryParam): void {
    this._searchParam = param;

    this._loadingStream.next(true);
    this._resultCountStream.next(0);

    this.cancelOngoingRequest();
    this._fetchedPages.clear();
    this._dataStream.next([]);
    this._fetchPage(0);
  }

  connect(collectionViewer: CollectionViewer): Observable<SearchResultItem[]> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end);

        for (let i = startPage; i <= endPage; i++) {
          this._fetchPage(i);
        }
      })
    );
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  private cancelOngoingRequest(): void {
    this._newSearch$.next();
    this._newSearch$.complete();
    this._newSearch$ = new Subject();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private _fetchPage(page: number) {
    if (!this._searchParam) {
      return;
    }
    if (this._fetchedPages.has(page)) {
      return;
    }
    this._fetchedPages.add(page);
    this._searchParam.page = page;

    const searchQuery$ =
      page === 0
        ? this.#searchService.newSearch(this._searchParam)
        : this.#searchService.page(page);

    searchQuery$.pipe(takeUntil(this._newSearch$)).subscribe((dataset) => {
      const searchResultGraph = rdfEnvironment.clownface(dataset);
      const searchResultIris = searchResultGraph.out(flux.queryNamedNode).values;
      if (searchResultIris.length === 0) {
        console.warn(`Invalid data: SearchResult.query is undefined`);
        return;
      }
      if (searchResultIris.length > 1) {
        console.warn(`Invalid data: SearchResult.query has more than one value. Using first value`);
      }
      const searchResult = new SearchResult(searchResultGraph.namedNode(searchResultIris[0]));
      if (page === 0) {
        this.total = searchResult.total;
        this._cachedData = Array.from<SearchResultItem>({ length: this.total });
        this._loadingStream.next(false);
        this._resultCountStream.next(this.total);
        this._classCountStream.next(dataset);
      }
      const resultItems = searchResult.result.sort((a, b) => {
        // sort descending by score
        return b.score - a.score;
      });

      this._cachedData.splice(
        searchResult.pageNumber * searchResult.pageSize,
        resultItems.length,
        ...resultItems
      );
      this._dataStream.next(this._cachedData);
    });
  }
}
