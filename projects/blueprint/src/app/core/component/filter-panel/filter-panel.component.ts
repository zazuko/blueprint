import {
  Component,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  OnDestroy,
  OnChanges,
  computed,
  signal,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';

import { Subject } from 'rxjs';

import { FilterItemComponent } from "../filter-item/filter-item.component";
import { fadeInOut } from "@blueprint/animation/fade-in-out/fade-in-out";
import { SearchFilter } from '../../../features/search/model/search-filter.model';
import { UiClassCount } from '@blueprint/model/ui-class-count/ui-class-count';

@Component({
  standalone: true,
  selector: 'bp-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fadeInOut,
  imports: [FormsModule, CheckboxModule, FilterItemComponent]
})
export class FilterPanelComponent implements OnChanges, OnDestroy {
  filtersChange = output<SearchFilter[]>();

  @Input() filterItems: SearchFilter[] = [];
  @Input() classCount: UiClassCount[] = [];

  filterItemsSignal = signal<SearchFilter[]>([]);
  classCountSignal = signal<UiClassCount[]>([]);

  uiFilterItems = computed<UiFilterItem[]>(() => {
    const classCount = this.classCountSignal();
    const filterItems = this.filterItemsSignal();

    const uiFilterItems = filterItems.map((filter) => {
      const uiFilterItem: UiFilterItem = {
        iri: filter.iri,
        icon: filter.icon,
        color: filter.color,

        label: filter.label,
        count: 0,
        checked: filter.include,
      };


      classCount
        .filter(cc => cc.iri === filter.iri)
        .forEach(cc => {
          uiFilterItem.count = cc.count;
        });

      return uiFilterItem;
    });
    return uiFilterItems;
  });

  private destroy$ = new Subject<void>();

  allInclude = false;

  ngOnChanges(changes: SimpleChanges): void {
    const classCount: UiClassCount[] = changes['classCount']?.currentValue;
    const filterItems = changes['filterItems']?.currentValue;

    if (classCount) {
      this.classCountSignal.set(classCount);
    }
    if (filterItems) {
      this.filterItems = filterItems;
      this.filterItemsSignal.set(filterItems)
    }
  }

  public toggleAll(event: boolean): void {
    this.filterItems = this.filterItems.map((filter) => {
      filter.include = event;
      return filter;
    });
    this.filtersChange.emit(this.filterItems.filter((f) => f.include));
  }

  public toggleFilter(): void {
    this.allInclude =
      this.filterItems.filter((searchFilter) => searchFilter.include === false)
        .length === 0;
    this.filtersChange.emit(this.filterItems.filter((f) => f.include));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}


interface UiFilterItem {
  iri: string;
  color: string;
  icon: string;
  label: string;
  count: number;
  checked: boolean;
}
