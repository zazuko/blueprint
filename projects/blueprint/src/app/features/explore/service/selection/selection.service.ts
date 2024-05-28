import { Injectable } from '@angular/core';

import { ReplaySubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  private selectedNode: ReplaySubject<string>;

  constructor() {
    this.selectedNode = new ReplaySubject(1);
  }

  get selectedNode$(): Observable<string> {
    return this.selectedNode.pipe(distinctUntilChanged());
  }

  public setSelectedNode(uri: string) {
    this.selectedNode.next(uri);
  }

  public clearSelection() {
    this.selectedNode = new ReplaySubject(1);
  }
}
