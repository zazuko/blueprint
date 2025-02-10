import { NgStyle } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
    selector: 'bp-comment',
    imports: [
        NgStyle,
        ScrollPanelModule,
        CardModule
    ],
    templateUrl: './comment.component.html',
    styleUrl: './comment.component.scss'
})
export class CommentComponent {
  text = input<string | null | undefined>(undefined);

  #maxHeight = 200;
  #minHeight = 100;

  comment = computed<string | null>(() => {
    if (!this.text()) {
      return null;
    }
    return this.text().trim();
  }
  );

  lineCount = computed<number>(() => {
    if (!this.comment()) {
      return 0;
    }
    return this.comment().split('\n').length;
  }
  );

  height = computed<number>(() => {
    if (!this.comment()) {
      return this.#minHeight;
    }
    return Math.min(this.#maxHeight, this.#minHeight + this.lineCount() * 20);
  }
  );


}
