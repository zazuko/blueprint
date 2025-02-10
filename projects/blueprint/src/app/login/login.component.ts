import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '@blueprint/service/auth/auth.service';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';

import { BrandLogoComponent } from "../core/layout/brand-logo/brand-logo.component";
import { MessageChannelService } from '../core/service/message-channel/message-channel.service';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
        ReactiveFormsModule, //
        InputTextModule,
        ButtonModule,
        BrandLogoComponent
    ]
})
export class LoginComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly #messageChannel = inject(MessageChannelService);

  readonly #authService = inject(AuthService);
  readonly #sparqlService = inject(SparqlService);

  loginForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
  });

  errorMessage = '';
  returnUrl = '';

  ngOnInit(): void {
    if (this.#authService.isAuthenticated()) {
      this.#router.navigate(['search']);
      return;
    }
    this.returnUrl = this.#route.snapshot.queryParams['returnUrl'] || '/';

    this.loginForm.valueChanges.pipe(
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe(() => this.errorMessage = '');
  }

  onSubmit(): void {
    const credentials = {
      username: this.loginForm.controls.username.value ?? '',
      password: this.loginForm.controls.password.value ?? ''
    };
    this.#authService.updateCredentials(credentials);

    this.#sparqlService
      .select('SELECT * WHERE { ?s ?p ?o . } LIMIT 1')
      .subscribe({
        next: () => {
          this.#messageChannel.debug('Login successful');
          this.#router.navigateByUrl(this.returnUrl);
        },
        error: () => {
          this.errorMessage = 'Wrong username or password';
          this.#authService.clear();
          this.#messageChannel.debug('Wrong username or password');
        },
        complete: () => this.#messageChannel.debug('Login Test SPARQL Query completed')

      }
      );
  }
}
