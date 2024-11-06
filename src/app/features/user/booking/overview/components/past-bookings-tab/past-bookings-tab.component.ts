import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BookingCardComponent } from '../booking-card/booking-card.component';
import { BookingSummaryComponent } from '../../../shared';
import { B2CBookingState, QrCodeService } from '@app/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-past-bookings-tab',
    templateUrl: './past-bookings-tab.component.html',
    styleUrls: ['./past-bookings-tab.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DividerModule,
        BookingCardComponent,
        BookingSummaryComponent,
    ],
})
export class PastBookingsTabComponent {
    bookingState = inject(B2CBookingState);
    qrCodeService = inject(QrCodeService);

    bookings$ = this.bookingState.pastBookings$.pipe(
        map((bookings) => {
            return bookings.map((booking) => {
                return {
                    ...booking,
                    bookings: booking.bookings.map((b) => ({
                        ...b,
                        qrcode: this.qrCodeService.generateQrCodeUrl(
                            booking.reservationBookingId,
                            `${b.bookingID}`
                        ),
                    })),
                };
            });
        })
    );
}
