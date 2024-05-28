
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationExtras,
  Params,
  Router,
} from '@angular/router';

import { Subject, Observable } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { InputTextModule } from 'primeng/inputtext';

import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';
import { UiClassCount } from '@blueprint/model/ui-class-count/ui-class-count';

import { SearchResultListComponent } from '../../../core/component/search-result-list/search-result-list.component';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { FormsModule } from '@angular/forms';
import { FilterPanelComponent } from '../../../core/component/filter-panel/filter-panel.component';
import { FilterItemService } from '../services/filter-item/filter-item.service';
import { SearchDataSourceService } from '../services/search-data-source/search-data-source.service';
import { ActiveFiltersService } from '../services/active-filters/active-filters.service';
import { SearchService } from '../services/search/search.service';
import { SearchQueryParam } from '../model/search-query-param.model';
import { SearchFilter } from '../model/search-filter.model';
'src/shapes/entity/flux-search-result-entity/flux-search-model/entity/ui-class-count-entity/ui-class-count.entity';

@Component({
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FilterPanelComponent,
    SearchResultListComponent,
    InputTextModule,
    FormsModule,
  ]
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly filterService = inject(ActiveFiltersService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly loadingIndicatorService = inject(LoadingIndicatorService);

  public readonly searchDataSource = inject(SearchDataSourceService);
  private readonly filterItemService = inject(FilterItemService);
  public readonly searchService = inject(SearchService);

  private searchTermSubject = new Subject<string>();


  currentPage = 0;

  isPageLoading = signal(false);
  searchTerm = signal('');
  resultCount = signal(0);
  searchResult = signal<SearchResultItem[]>([]);
  classCount = signal<UiClassCount[]>([]);

  private searchParam: SearchQueryParam = {
    term: '',
    page: 0,
    filter: [],
  };
  searchResultCount$: Observable<number> | null = null;
  activeFilters: SearchFilter[] = [];

  searchFilterItems$: Observable<SearchFilter[]>;
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchFilterItems$ = this.filterItemService.searchFilter$;
    this.searchTermSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged()
    )
      .subscribe(term => {
        this.onSearchTermChanged(term);

      });
  }

  ngOnInit(): void {

    this.searchService.classCount$.pipe(takeUntil(this.destroy$)).subscribe(classCount => {
      this.classCount.set(classCount as unknown as UiClassCount[]);
    }
    );

    this.searchService.totalCount$.pipe(takeUntil(this.destroy$)).subscribe(totalCount => {
      this.resultCount.set(totalCount);
    }
    );

    this.searchService.searchResult$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(searchResult => {
      const oldResult = this.searchResult();
      const newResult = searchResult as unknown as SearchResultItem[];
      this.searchResult.set([...oldResult, ...newResult]);
      this.loadingIndicatorService.done();
    });

    this.route.queryParams
      .pipe(map((queryParam) => queryParam['searchTerm']))
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.loadingIndicatorService.loading();
        this.searchTerm.set(searchTerm || '');
        this.searchParam.term = this.searchTerm();
        this.searchParam.page = 0;
        this.searchResult.set([]);
        this._search();
      });
  }

  onSearchInput(search: string) {
    this.searchTermSubject.next(search);
  }

  onMore(): void {
    const currentPage = this.searchParam.page ?? 0;
    this.searchParam.page = currentPage + 1;
    this._search();
  }


  private _search(): void {
    this.searchService.search(this.searchParam);
  }

  onFilterChange(newFilter: SearchFilter[]): void {
    this.loadingIndicatorService.loading();
    this.activeFilters = newFilter;
    this.filterService.activeFilter = this.activeFilters;
    this.searchResult.set([]);
    this.searchParam.filter = this.activeFilters;
    this._search();
  }

  onSearchTermChanged(newTerm: string): void {
    const queryParams: Params = {
      searchTerm: newTerm,
    };
    const navigationExtras: NavigationExtras = {
      queryParams,
    };
    this.router.navigate([], navigationExtras);
  }

  onItemSelected(item: SearchResultItem): void {
    const queryParams: Params = {
      searchTerm: this.searchParam.term,
      l: item.label,
    };
    const navigationExtras: NavigationExtras = {
      queryParams,
    };
    this.router.navigate(['explore', item.iri], navigationExtras);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
