import { Injectable } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

import { SearchFilter } from '../../model/search-filter.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveFiltersService {
  private _activeFilters$ = new ReplaySubject<SearchFilter[]>(1);

  private _activeFilters: SearchFilter[] = [];

  get activeFilters$(): Observable<SearchFilter[]> {
    return this._activeFilters$;
  }

  set activeFilter(filter: SearchFilter[]) {
    this._activeFilters = filter;
    this._activeFilters$.next(this._activeFilters);
  }
}
