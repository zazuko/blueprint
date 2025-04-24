import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
    provideRouter, withComponentInputBinding, withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { APP_INITIALIZER } from '@angular/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfigService } from './core/service/config/config.service';
import { authInterceptor } from '@blueprint/http-interceptor/auth-interceptor/auth-interceptor.function';

import { providePrimeNG } from 'primeng/config';
import { AppTheme } from './app-theme';

import { environment } from '../environments/environment';
import { env } from 'process';

function initializeAppFactory(configService: ConfigService): () => void {
    return () => configService.fetchConfig()
}

const dontUseAuth = !environment.skipAuthentication;
export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(environment.skipAuthentication ? withInterceptors([]) : withInterceptors([authInterceptor])),
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
        providePrimeNG({
            theme: {
                preset: AppTheme,
                options: {
                    darkModeSelector: '.bp-dark-mode',
                }
            }
        })
    ],
};