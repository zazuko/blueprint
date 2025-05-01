import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';

import { SearchFilter } from '../../model/search-filter.model';
import { labelAlphaSort } from 'projects/blueprint/src/app/core/utils/sort-functions';

@Injectable({
  providedIn: 'root',
})
export class FilterItemService {
  private readonly uiClassMetadataService = inject(UiClassMetadataService);

  get searchFilter$(): Observable<SearchFilter[]> {
    return this.uiClassMetadataService.getClassMetadata().pipe(
      map((classMetadataArray) => {

        return classMetadataArray
          .map((classMetadata) => {
            const searchFilter = {} as SearchFilter;
            searchFilter.iri = classMetadata.targetNode.value;
            searchFilter.label = classMetadata.label;
            searchFilter.include = false;
            searchFilter.count = 0;
            searchFilter.filterCount = 1; // avoid filtering
            searchFilter.icon = classMetadata.icon;
            searchFilter.color = classMetadata.color;
            return searchFilter;
          })
          .sort(labelAlphaSort);
      })
    );
  }
}
