import { select, drag } from 'd3';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  output,
} from '@angular/core';

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[fluxDraggable]',
})
export class DraggableDirective implements OnDestroy, AfterViewInit {
  dragStartEvent = output<DragEvent>();
  dragEvent = output<DragEvent>();
  dragEndEvent = output<DragEvent>();

  private readonly elementRef = inject(ElementRef);

  ngAfterViewInit(): void {
    select(this.elementRef.nativeElement).call(
      drag()
        .on('start.node', (event) => this.dragStartEvent.emit(event))
        .on('drag.node', (event) => this.dragEvent.emit(event))
        .on('end.node', (event) => this.dragEndEvent.emit(event))
    );
  }

  ngOnDestroy() {
    select(this.elementRef.nativeElement).call(drag().on('.drag', null));
  }
}
