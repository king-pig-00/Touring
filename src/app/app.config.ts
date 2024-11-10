import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    provideHttpClient,
    HTTP_INTERCEPTORS,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthInterceptor, AuthService } from '@app/core';
import { ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        AuthService,
        provideHttpClient(withInterceptorsFromDi()),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(ROUTES),
        provideAnimations(),
    ],
};
