import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import {
    provideRouter, withComponentInputBinding, withInMemoryScrolling,
} from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { firstValueFrom } from 'rxjs';

import { providePrimeNG } from 'primeng/config';

import { AppTheme } from './app-theme';
import { routes } from './app.routes';
import { ConfigService } from './core/service/config/config.service';
import { authInterceptor } from '@blueprint/http-interceptor/auth-interceptor/auth-interceptor.function';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
        provideRouter(routes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withComponentInputBinding()
        ),
        provideAnimations(),
        provideAppInitializer(() => {
            const configService = inject(ConfigService);
            return firstValueFrom(configService.fetchConfig());
        }),
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