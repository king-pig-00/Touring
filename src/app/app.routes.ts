import { Route } from '@angular/router';
import { AuthGuard } from './core';
import { RoleGuard } from './core';

export const ROUTES: Route[] = [
    {
        path: 'home',
        loadComponent: () =>
            import('./features/home/home.component').then(
                (c) => c.HomeComponent
            ),
    },
    {
        path: 'operator',
        loadChildren: () =>
            import('./features/operator/operator.routes').then(
                (r) => r.OPERATOR_ROUTES
            ),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['admin', 'agent'] },
    },
    {
        path: 'user',
        loadChildren: () =>
            import('./features/user/user.routes').then((r) => r.USER_ROUTES),
        canActivate: [AuthGuard],
    },
    {
        path: 'unauthorized',
        loadComponent: () =>
            import(
                './features/errors/unauthorized/unauthorized.component'
            ).then((c) => c.UnauthorizedComponent),
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    { path: '**', redirectTo: 'home' },
];
