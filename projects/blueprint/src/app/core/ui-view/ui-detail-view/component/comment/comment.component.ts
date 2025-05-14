import { Component, computed, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'bp-comment',
  imports: [
    ScrollPanelModule,
    CardModule
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  text = input.required<string>();

  #maxHeight = 200;
  #minHeight = 100;

  comment = computed<string>(() => {
    return this.text().trim();
  });

  lineCount = computed<number>(() => {
    return this.comment().split('\n').length;
  });

  height = computed<number>(() => {
    const lineCount = this.lineCount();
    return Math.min(this.#maxHeight, this.#minHeight + lineCount * 20);
  });

}
