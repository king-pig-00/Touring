import { Route } from '@angular/router';
// import { Features, featureGuardCanActivate } from '@app/core';

export const BOOKING_MANAGEMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./company-settings.component').then(
                (c) => c.CompanySettingsComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'company-info',
                pathMatch: 'full',
            },
            {
                path: 'company-info',
                loadComponent: () =>
                    import('./pages/company-info/company-info.component').then(
                        (c) => c.CompanyInfoComponent
                    ),
                // canActivate: [featureGuardCanActivate],
                // data: {
                //     feature: Features.bookingManagement.name,
                //     pages: [
                //         Features.bookingManagement.pages.tourInventory.name,
                //     ],
                // },
            },
            {
                path: 'departments',
                loadComponent: () =>
                    import('./pages/departments/departments.component').then(
                        (c) => c.DepartmentsComponent
                    ),
                // canActivate: [featureGuardCanActivate],
                // data: {
                //     feature: Features.bookingManagement.name,
                //     pages: [
                //         Features.bookingManagement.pages.tourInventory.name,
                //     ],
                // },
            },
            {
                path: 'positions',
                loadComponent: () =>
                    import('./pages/positions/positions.component').then(
                        (c) => c.PositionsComponent
                    ),
                // canActivate: [featureGuardCanActivate],
                // data: {
                //     feature: Features.bookingManagement.name,
                //     pages: [
                //         Features.bookingManagement.pages.tourInventory.name,
                //     ],
                // },
            },
        ],
    },
];
