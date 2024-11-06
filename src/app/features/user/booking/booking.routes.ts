import { Route } from '@angular/router';
// import { unsavedChangesCanDeactivate } from '@app/core';

export const BOOKING_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./overview/overview.component').then(
                (c) => c.OverviewComponent
            ),
    },
    // {
    //     path: ':id',
    //     loadComponent: () =>
    //         import('./manage/manage.component').then((c) => c.ManageComponent),
    //     canDeactivate: [unsavedChangesCanDeactivate],
    // },
];
