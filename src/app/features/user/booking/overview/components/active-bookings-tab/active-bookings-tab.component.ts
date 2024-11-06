import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BookingCardComponent } from '../booking-card/booking-card.component';
import { BookingSummaryComponent } from '../../../shared';
import {
    B2CBookingGroup,
    B2CBookingState,
    Booking,
    QrCodeService,
} from '@app/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    standalone: true,
    selector: 'app-active-bookings-tab',
    templateUrl: './active-bookings-tab.component.html',
    styleUrls: ['./active-bookings-tab.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DividerModule,
        BookingCardComponent,
        BookingSummaryComponent,
    ],
})
export class ActiveBookingsTabComponent {
    bookingState = inject(B2CBookingState);
    qrCodeService = inject(QrCodeService);

    bookings$: Observable<B2CBookingGroup[]> =
        this.bookingState.futureBookings$.pipe(
            map((bookings) =>
                bookings
                    .map((booking) => {
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
                    })
                    .sort(
                        (a: B2CBookingGroup, b: B2CBookingGroup) =>
                            new Date(b.bookings[0].bookingDate).getTime() -
                            new Date(a.bookings[0].bookingDate).getTime()
                    )
            )
        );

    cancelOrder(reservationBookingId: string): void {
        if (!reservationBookingId) {
            return;
        }
        this.bookingState.cancelBooking(reservationBookingId, () =>
            this.bookingState.getBookings()
        );
    }
}
