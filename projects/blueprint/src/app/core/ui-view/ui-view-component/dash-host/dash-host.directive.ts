import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[fluxDashHost]'
})
export class DashHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
