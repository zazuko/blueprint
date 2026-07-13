import {
  Component,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { UIConfigurationService } from './service/uiconfiguration.service';
import { BreadcrumbPageComponent } from '../../../shared/component/page/breadcrumb-page/breadcrumb-page.component';
import { Breadcrumb } from '../../../shared/component/breadcrumb-navigation/model/breadcrumb.model';
import { LinkConfiguration } from '@blueprint/service/config/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'bp-uiconfiguration',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbPageComponent,
    MatButtonToggleModule,
  ],
  templateUrl: './uiconfiguration.component.html',
  styleUrl: './uiconfiguration.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [UIConfigurationService],
})
export class UIConfigurationComponent {
  readonly #uiConfig = inject(UIConfigurationService);
  readonly #destroyRef = inject(DestroyRef);

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '.',
      disabled: false,
    },
  ];
  readonly formBuilder = inject(FormBuilder);

  uiConfigurationFormGroup: FormGroup = this.formBuilder.group({
    link: [this.#uiConfig.uiLinkConfiguration()],
  });

  stateOptions: any[] = [
    { label: 'Configured only', value: 'app' },
    { label: 'RDF only', value: 'rdf' },
    { label: 'Both', value: 'both' },
  ];

  currentLinkOption = this.#uiConfig.uiLinkConfiguration;

  constructor() {
    this.uiConfigurationFormGroup.statusChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((status) => {
        if (status === 'VALID') {
          const linkOption = this.uiConfigurationFormGroup.get('link')
            .value as LinkConfiguration;
          this.#uiConfig.setLinkConfiguration(linkOption);
        }
      });
  }
}
