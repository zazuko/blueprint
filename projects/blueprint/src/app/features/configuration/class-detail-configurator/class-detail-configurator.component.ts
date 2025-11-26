import { Component, DestroyRef, Input, OnChanges, SimpleChanges, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { map } from 'rxjs';

import { DragDropModule } from 'primeng/dragdrop';

import { rdfs } from '@blueprint/ontology';
import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';

import { MessageChannelService } from '@blueprint/service/message-channel/message-channel.service';

import { AvatarComponent, Avatar } from '@blueprint/component/avatar/avatar.component';

import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from "../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { LoadingIndicatorService } from '@blueprint/component/loading-indicator/service/loading-indicator.service';


@Component({
  selector: 'bp-class-detail-configurator',
  standalone: true,
  templateUrl: './class-detail-configurator.component.html',
  styleUrl: './class-detail-configurator.component.scss',
  imports: [BreadcrumbPageComponent, AvatarComponent, DragDropModule]
})
export class ClassDetailConfiguratorComponent implements OnChanges {
  @Input({ required: true }) id: string;
  @Input({ required: true }) className: string;

  private readonly sparqlService = inject(SparqlService);
  private readonly classMetadata = inject(UiClassMetadataService);

  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageChannel = inject(MessageChannelService);


  public readonly availablePredicates = signal<Predicate[]>([]);
  public readonly selectedPredicates = signal<Predicate[]>([]);

  public readonly configuredPredicates = signal<PredicateConfiguration[]>([]);

  public readonly predicateSelectionEffect = effect(() => {
    const selectedPredicates = this.selectedPredicates();

    const cp = selectedPredicates.map(predicate => {
      return {
        predicate: predicate,
        renderLiteralAs: LiteralRenderType.PLAIN
      } as PredicateConfiguration
    });
    this.configuredPredicates.set(cp);
  }, { allowSignalWrites: true });

  public classMetadataSignal = signal<UiClassMetadata | null | undefined>(undefined);
  public readonly avatars = computed<Avatar[]>(() => {
    const classMetadata = this.classMetadataSignal();
    if (classMetadata) {
      return [{
        label: classMetadata.label,
        color: classMetadata.color,
        icon: classMetadata.icon,
        classIri: classMetadata.targetNode.value
      }];
    }
    return [];
  });

  public breadcrumbs = signal<Breadcrumb[]>([
    {
      label: 'Settings',
      route: '../../../..',
      disabled: false
    },
    {
      label: 'Details',
      route: '../../..',
      disabled: false
    }
  ]);

  draggedPredicate: Predicate | undefined | null;

  selectedPredicateSignal = signal<Predicate | null>(null);
  /** dnd */
  dragStart(predicate: Predicate) {
    this.draggedPredicate = predicate;
  }

  dragEnd() {
    this.draggedPredicate = null;
  }

  drop() {
    if (this.draggedPredicate) {
      this.selectedPredicates.set([...(this.selectedPredicates()), this.draggedPredicate]);
      this.availablePredicates.set(this.availablePredicates().filter(p => p.iri != this.draggedPredicate.iri));
      this.draggedPredicate = null;
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    const className = changes['className']?.currentValue;
    if (className) {
      const lastBreadcrumb: Breadcrumb = {
        label: className,
        route: '.',
        disabled: false
      }
      this.breadcrumbs.set([...this.breadcrumbs(), lastBreadcrumb])
    }

    const id = changes['id']?.currentValue;
    if (id) {
      this.loadingIndicatorService.loading();
      this.classMetadata.getClassMetadata().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(
        {
          next: allClassesMetadataArray => {
            const classMetadata = allClassesMetadataArray.find(uiClass => uiClass.label === className);
            if (classMetadata) {
              this.classMetadataSignal.set(classMetadata);
            } else {
              this.classMetadataSignal.set(null);
            }
            this.loadingIndicatorService.done();
          },
          error: err => {
            this.loadingIndicatorService.done();
            this.messageChannel.error('Error loading Details', err);
          },
          complete: () => {
            this.loadingIndicatorService.done();
          }
        })
    }
  }

  getProps() {
    const targetClassIri = this.classMetadataSignal()?.targetNode.value;
    if (!targetClassIri) {
      return;
    }

    const query = `
    ${rdfs.sparqlPrefix()}

    SELECT DISTINCT ?predicate
    WHERE {
      ?s a <${targetClassIri}> .
      ?s ?predicate ?o .
      FILTER (?predicate != ${rdfs.labelPrefixed} && ?predicate != ${rdfs.commentPrefixed})
      FILTER (!isIRI(?o))
    } 
    ORDER BY ?predicate
    `;

    this.sparqlService.select(query).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(result => result.map(row => row["predicate"].value)
      ),
      map(iris => {
        return iris.map(iri => {
          return {
            iri: iri,
            label: this.shortenIri(iri)
          } as Predicate
        })
      })
    ).subscribe(
      {
        next: result => {
          this.availablePredicates.set(result);
        },
        error: err => {
          this.messageChannel.error('Error loading Details', err);
        }
      }
    );

  }

  private shortenIri(iri: string) {
    const splitChar = iri.includes('#') ? '#' : '/';
    const parts = iri.split(splitChar);
    return parts[parts.length - 1];
  }

  selectPredicate(predicate: Predicate) {
    this.selectedPredicateSignal.set(predicate);
  }
}

interface Predicate {
  iri: string;
  label: string;
}

interface PredicateConfiguration {
  predicate: Predicate;
  renderLiteralAs: LiteralRenderType;
}

export enum LiteralRenderType {
  PLAIN,
  LINK,
  EMAIL,
  PHONE
}
