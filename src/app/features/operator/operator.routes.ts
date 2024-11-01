import { Route } from '@angular/router';
import { AuthGuard, RoleGuard } from '@app/core';

export const OPERATOR_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./operator.component').then((c) => c.OperatorComponent),
        children: [
            {
                path: '',
                redirectTo: 'company-settings',
                pathMatch: 'full',
            },
            {
                path: 'company-settings',
                loadChildren: () =>
                    import(
                        './pages/company-settings/company-settings.routes'
                    ).then((r) => r.BOOKING_MANAGEMENT_ROUTES),
                canActivate: [AuthGuard, RoleGuard],
                data: { roleId: 1 },
            },
            // {
            //     path: 'user-management',
            //     loadChildren: () =>
            //         import(
            //             './pages/user-management/user-management.routes'
            //         ).then((r) => r.USER_MANAGEMENT_ROUTES),
            //     canActivate: [featureGuardCanActivate],
            //     data: {
            //         feature: Features.userManagement.name,
            //         pages: Object.values(Features.userManagement.pages).map(
            //             (page) => page.name
            //         ),
            //     },
            // },
            {
                path: '**',
                redirectTo: 'company-settings',
            },
        ],
    },
];
