import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectionPositionPair } from '@angular/cdk/overlay';

const DEFAULT_TREE_ITEM: TreeItem = {
  label: 'Gesamtkatalog',
  iri: 'http://parent-1',
  parentIri: null,
  children: [
    {
      label: 'Locations',
      iri: 'http://parent-1-1',
      parentIri: 'http://parent-1',
      children: [
        {
          label: 'Kanton',
          iri: 'http://parent-1-1-1',
          parentIri: 'http://parent-1-1',
          children: []
        },
        {
          label: 'Organisation',
          iri: 'http://parent-1-1-2',
          parentIri: 'http://parent-1-1',
          children: []
        }
      ]
    },
    {
      label: 'Persons',
      iri: 'http://parent-1-2',
      parentIri: 'http://parent-1',
      children: [
        {
          label: 'BAFU Mitarbeiter',
          iri: 'http://parent-1-2-1',
          parentIri: 'http://parent-1-2',
          children: []
        },
        {
          label: 'EDA Mitarbeiter',
          iri: 'http://parent-1-2-2',
          parentIri: 'http://parent-1-2',
          children: []
        }
      ]
    },
    {
      label: 'IT',
      iri: 'http://parent-1-3',
      parentIri: 'http://parent-1',
      children: [
        {
          label: 'Architektur',
          iri: 'http://parent-1-3-1',
          parentIri: 'http://parent-1-3',
          children: [
            {
              label: 'Daten Fluss',
              iri: 'http://parent-1-3-1-1',
              parentIri: 'http://parent-1-3-1',
              children: []
            },
            {
              label: 'Applikationen',
              iri: 'http://parent-1-3-1-2',
              parentIri: 'http://parent-1-3-1',
              children: []
            },
            {
              label: 'Geschäftsonjekte',
              iri: 'http://parent-1-3-1-3',
              parentIri: 'http://parent-1-3-1',
              children: [
                {
                  label: 'Attribute',
                  iri: 'http://parent-1-3-1-3-1',
                  parentIri: 'http://parent-1-3-1-3',
                  children: []
                },
                {
                  label: 'Wertebereich',
                  iri: 'http://parent-1-3-1-3-2',
                  parentIri: 'http://parent-1-3-1-3',
                  children: []
                }
              ]
            }
          ]
        },
        {
          label: 'Organisationen',
          iri: 'http://parent-1-3-2',
          parentIri: 'http://parent-1-3',
          children: [
            {
              label: 'Bund',
              iri: 'http://parent-1-3-2-1',
              parentIri: 'http://parent-1-3-2',
              children: []
            },
            {
              label: 'What Ever',
              iri: 'http://parent-1-3-2-2',
              parentIri: 'http://parent-1-3-2',
              children: []
            }
          ]
        }
      ]
    }

  ]

}
@Component({
  selector: 'flux-tree-walker',
  standalone: true,
  imports: [CommonModule, CdkMenu, CdkMenuItem, CdkMenuTrigger],
  templateUrl: './tree-walker.component.html',
  styleUrl: './tree-walker.component.scss'
})
export class TreeWalkerComponent {
  @Input() tree: TreeItem = DEFAULT_TREE_ITEM;

  parentItem = signal<TreeItem | null>(null);
  selectedItem = signal<TreeItem | null>(null);


  miniMenuPositions = [
    new ConnectionPositionPair(
      { originX: 'end', originY: 'center' },
      { overlayX: 'start', overlayY: 'center' },
    ),

    new ConnectionPositionPair(
      { originX: 'start', originY: 'center' },
      { overlayX: 'end', overlayY: 'center' },
    ),
  ]
  openItem(item: TreeItem): void {
    if (item.children.length > 0) {
      this.parentItem.set(item);
      this.selectedItem.set(item);
    }
  }
}



export interface TreeItem {
  label: string;
  iri: string;
  parentIri: string | null;
  children: TreeItem[];
}