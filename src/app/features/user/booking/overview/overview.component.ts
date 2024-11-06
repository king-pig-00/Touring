import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
// import {
//     ActiveBookingsTabComponent,
//     PastBookingsTabComponent,
// } from './components';
// import { B2CBookingState, ErrorDialogMessages, UIState } from '@app/core';
// import { CancelBookingModalComponent } from '../shared';

@Component({
    standalone: true,
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    imports: [
        CommonModule,
        TabViewModule,
        // ActiveBookingsTabComponent,
        // PastBookingsTabComponent,
        // CancelBookingModalComponent,
    ],
})
export class OverviewComponent {
    // bookingState = inject(B2CBookingState);
    // uiState = inject(UIState);

    ngOnInit(): void {
        // this.bookingState.getBookings().catch(() => {
        //     this.uiState.openErrorDialog({
        //         title: ErrorDialogMessages.b2c.bookingOVerview.loadBookingsError
        //             .title,
        //         description:
        //             ErrorDialogMessages.b2c.bookingOVerview.loadBookingsError
        //                 .description,
        //         buttons: [
        //             {
        //                 text: ErrorDialogMessages.b2c.bookingOVerview
        //                     .loadBookingsError.buttons.close,
        //                 onClick: () => {},
        //                 isPrimary: true,
        //             },
        //         ],
        //     });
        // });
    }
}
