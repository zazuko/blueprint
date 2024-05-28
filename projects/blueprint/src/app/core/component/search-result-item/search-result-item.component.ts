import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvatarComponent } from '../avatar/avatar.component';
import { SearchResultItem } from '@blueprint/model/search-result-item/search-result-item';

@Component({
  selector: 'bp-search-result-item',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './search-result-item.component.html',
  styleUrl: './search-result-item.component.scss'
})
export class SearchResultItemComponent {
  item = input.required<SearchResultItem>();
  selected = output<SearchResultItem>();

  emitSelected(): void {
    this.selected.emit(this.item());
  }
}
