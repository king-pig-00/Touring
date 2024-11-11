import { Route } from '@angular/router';

export const USER_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./user.component').then((c) => c.UserComponent),
        children: [
            {
                path: '',
                redirectTo: 'booking',
                pathMatch: 'full',
            },
            {
                path: 'booking',
                loadChildren: () =>
                    import('./booking/booking.routes').then(
                        (r) => r.BOOKING_ROUTES
                    ),
            },
            // {
            //     path: 'payment',
            //     loadChildren: () =>
            //         import('./payment/payment.routes').then(
            //             (r) => r.PAYMENT_ROUTES
            //         ),
            //     canActivate: [featureFlagCanActivate],
            //     data: {
            //         featureFlag: {
            //             feature: 'payments',
            //             page: 'overview',
            //         },
            //     },
            // },
            // {
            //     path: 'profile',
            //     loadComponent: () =>
            //         import('./profile/profile.component').then(
            //             (c) => c.ProfileComponent
            //         ),
            // },
            {
                path: '**',
                redirectTo: 'booking',
            },
        ],
    },
];
