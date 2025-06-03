
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationExtras,
  Params,
  Router,
} from '@angular/router';

import { Subject, Observable, map, debounceTime, distinctUntilChanged } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';
import { UiClassCount } from '@blueprint/model/ui-class-count/ui-class-count';

import { SearchResultListComponent } from '../search-result-list/search-result-list.component';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { FormsModule } from '@angular/forms';
import { FilterPanelComponent } from '../../../core/component/filter-panel/filter-panel.component';
import { FilterItemService } from '../services/filter-item/filter-item.service';
import { SearchDataSourceService } from '../services/search-data-source/search-data-source.service';
import { ActiveFiltersService } from '../services/active-filters/active-filters.service';
import { SearchService } from '../services/search/search.service';
import { SearchQueryParam } from '../model/search-query-param.model';
import { SearchFilter } from '../model/search-filter.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
'src/shapes/entity/flux-search-result-entity/flux-search-model/entity/ui-class-count-entity/ui-class-count.entity';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FilterPanelComponent,
    SearchResultListComponent,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
  ]
})
export class SearchComponent implements OnInit {
  readonly #filterService = inject(ActiveFiltersService);

  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly #loadingIndicatorService = inject(LoadingIndicatorService);

  readonly #filterItemService = inject(FilterItemService);
  public readonly searchDataSource = inject(SearchDataSourceService);
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

  constructor() {
    this.searchFilterItems$ = this.#filterItemService.searchFilter$;
    this.searchTermSubject.pipe(
      takeUntilDestroyed(this.#destroyRef),
      debounceTime(400),
      map(term => {
        if (term.length > 3 || term.length === 0) {
          return term;
        }
        else {
          console.log('Search term must be at least 3 characters long');
          console.log('Search term is currently ' + term.length + ' characters long');
          console.log('Search term is currently ' + term);
          return '';
        }
      }),
      distinctUntilChanged()
    )
      .subscribe(term => {
        this.onSearchTermChanged(term);

      });
  }

  ngOnInit(): void {

    this.searchService.classCount$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(classCount => {
      this.classCount.set(classCount as unknown as UiClassCount[]);
    }
    );

    this.searchService.totalCount$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(totalCount => {
      this.resultCount.set(totalCount);
    }
    );

    this.searchService.searchResult$.pipe(
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe(searchResult => {
      const oldResult = this.searchResult();
      const newResult = searchResult as unknown as SearchResultItem[];
      this.searchResult.set([...oldResult, ...newResult]);
      this.#loadingIndicatorService.done();
    });

    this.#route.queryParams
      .pipe(
        map((queryParam) => queryParam['searchTerm']),
        takeUntilDestroyed(this.#destroyRef))
      .subscribe((searchTerm) => {
        this.#loadingIndicatorService.start();
        this.searchTerm.set(searchTerm || '');
        this.searchParam.term = this.searchTerm();
        this.searchParam.page = 0;
        this.searchResult.set([]);
        this.#search();
      });
  }

  onSearchInput(search: string) {
    this.searchTermSubject.next(search);
  }

  showMoreItems(): void {
    const currentPage = this.searchParam.page ?? 0;
    this.searchParam.page = currentPage + 1;
    this.#search();
  }


  #search(): void {
    this.searchService.search(this.searchParam);
  }

  onFilterChange(newFilter: SearchFilter[]): void {
    this.#loadingIndicatorService.start();
    this.activeFilters = newFilter;
    this.#filterService.activeFilter = this.activeFilters;
    this.searchResult.set([]);
    this.searchParam.filter = this.activeFilters;
    this.#search();
  }

  onSearchTermChanged(newTerm: string): void {
    const queryParams: Params = {
      searchTerm: newTerm,
    };
    const navigationExtras: NavigationExtras = {
      queryParams,
    };
    this.#router.navigate([], navigationExtras);
  }

  /**
   * Navigates to the selected item in the search result.
   * 
   * @param item Item to navigate to
   */
  navigateToItem(item: SearchResultItem): void {
    const queryParams: Params = {
      searchTerm: this.searchParam.term,
      l: item.label,
    };
    const navigationExtras: NavigationExtras = {
      queryParams,
      fragment: "Information"
    };
    this.#router.navigate(['explore', item.iri], navigationExtras);
  }

}
