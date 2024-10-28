import { Route } from '@angular/router';
import { AuthGuard } from './core';
import { RoleGuard } from './core';

// export const routes: Routes = [];

export const ROUTES: Route[] = [
    {
        path: '',
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
        data: { roleId: 1 },
    },
    // {
    //     path: 'admin',
    //     loadChildren: () =>
    //         import('./features/admin/admin.routes').then((r) => r.ADMIN_ROUTES),
    //     canActivate: [roleGuardCanActivate],
    //     data: {
    //         expectedRole: [roles.CruiseCodeAdmin],
    //         overrideRole: [roles.Developer, roles.CruiseCodeAdmin],
    //     },
    // },
    {
        path: 'home',
        loadComponent: () =>
            import('./features/home/home.component').then(
                (c) => c.HomeComponent
            ),
        // canActivate: [authedGuardCanActivate],
    },
    // {
    //     path: 'forbidden',
    //     loadComponent: () =>
    //         import('./features/forbidden/forbidden.component').then(
    //             (c) => c.ForbiddenComponent
    //         ),
    // },
    // {
    //     // for when automatically logging in doesn't work, redirect the user to sign-in-redirect
    //     // path and it will trigger the signin redirect flow
    //     path: 'sign-in-redirect',
    //     component: SignInRedirectComponent,
    // },
    // {
    //     path: '',
    //     redirectTo: 'operator',
    //     pathMatch: 'full',
    // },
    {
        path: 'unauthorized',
        loadComponent: () =>
            import('./features/errors/unauthorized/unauthorized.component').then(
                (c) => c.UnauthorizedComponent
            ),
    },
    { path: '**', redirectTo: '' },
];
