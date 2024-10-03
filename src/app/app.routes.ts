import { Route } from '@angular/router';

// export const routes: Routes = [];

export const ROUTES: Route[] = [
    {
        path: 'operator',
        loadChildren: () =>
            import('./features/operator/operator.routes').then(
                (r) => r.OPERATOR_ROUTES
            ),
        // TODO: we'll need to update this once we have MSAl configured
        // canActivate: [roleGuardCanActivate],
        // data: {
        //     expectedRole: [
        //         roles.Agent,
        //         roles.InhouseAgent,
        //         roles.Employee,
        //         roles.Admin,
        //     ],
        //     overrideRole: [roles.Developer, roles.CruiseCodeAdmin],
        // },
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
    // {
    //     path: 'home',
    //     loadComponent: () =>
    //         import('./features/home/home.component').then(
    //             (c) => c.HomeComponent
    //         ),
    //     canActivate: [authedGuardCanActivate],
    // },
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
    { path: '**', redirectTo: '' },
];
