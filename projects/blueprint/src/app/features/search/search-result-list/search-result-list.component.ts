import {
  Component,
  output,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';
import { fadeInOut } from '../../../core/animation/fade-in-out/fade-in-out';
import { SearchResultItemComponent } from '../search-result-item/search-result-item.component';

@Component({
  selector: 'bp-search-result-list',
  templateUrl: './search-result-list.component.html',
  styleUrl: './search-result-list.component.scss',
  imports: [SearchResultItemComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [fadeInOut],
})
export class SearchResultListComponent {
  readonly searchResult = input.required<SearchResultItem[]>();
  readonly total = input.required<number>();

  more = output<void>();
  selected = output<SearchResultItem>();

  emitMore(): void {
    this.more.emit();
  }

  emitSelected(item: SearchResultItem): void {
    this.selected.emit(item);
  }
}
