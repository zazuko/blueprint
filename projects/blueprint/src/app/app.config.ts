import { ApplicationConfig } from '@angular/core';
import {
    provideRouter, withComponentInputBinding, withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfigService } from './core/service/config/config.service';

import { AuthInterceptor } from '@blueprint/http-interceptor/auth-interceptor/auth-interceptor.service';

function initializeAppFactory(configService: ConfigService): () => void {
    return () => configService.fetchConfig()
}

export const appConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(HttpClientModule),
        provideRouter(routes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withComponentInputBinding()
        ),
        provideAnimations(),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeAppFactory,
            deps: [ConfigService],
            multi: true
        },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }

    ],
};