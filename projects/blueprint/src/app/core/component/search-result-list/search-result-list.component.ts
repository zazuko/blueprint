import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultItemComponent } from "../search-result-item/search-result-item.component";
import { ButtonModule } from 'primeng/button';
import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';
import { fadeInOut } from '@blueprint/animation/index';

@Component({
    selector: 'bp-search-result-list',
    templateUrl: './search-result-list.component.html',
    styleUrl: './search-result-list.component.scss',
    imports: [CommonModule, SearchResultItemComponent, ButtonModule],
    animations: [fadeInOut]
})
export class SearchResultListComponent {

  @Input() searchResult: SearchResultItem[] = [];
  @Input() total = 0;

  more = output<void>();
  selected = output<SearchResultItem>();

  emitMore(): void {
    this.more.emit();
  }

  emitSelected(item: SearchResultItem): void {
    this.selected.emit(item);
  }




}
