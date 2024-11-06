import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import {
    B2CBookingState,
    BookingDetails,
    Features,
    QrCodeService,
} from '@app/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PermissionDirective, TimeFormatPipe } from '@app/shared';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
@Component({
    standalone: true,
    selector: 'app-booking-card',
    templateUrl: './booking-card.component.html',
    styleUrls: ['./booking-card.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        DividerModule,
        TagModule,
        TimeFormatPipe,
        BadgeModule,
        PermissionDirective,
    ],
})
export class BookingCardComponent {
    @Input() booking: (BookingDetails & { qrcode?: string }) | undefined;
    @Input() allowEdit = false;
    @Input() cancelled = false;
    @Input() index = 1;
    // @ViewChild('qrCodeContainer', { static: false }) qrCodeContainer:
    //     | ElementRef
    //     | undefined;
    qrCodeService = inject(QrCodeService);
    bookingState = inject(B2CBookingState);
    features = Features;

    // ngAfterViewInit(): void {
    //     if (this.booking?.bookingID) {
    //         this.generateQrCode(this.booking.bookingID.toString());
    //     }
    // }

    cancelOrder(): void {
        const reservationBookingId = this.booking?.reservationBookingId;
        if (!reservationBookingId) {
            return;
        }
        this.bookingState.cancelBooking(reservationBookingId, () =>
            this.bookingState.getBookings()
        );
    }

    // private generateQrCode(bookingId: string): void {
    //     const reservationBookingId = this.booking?.reservationBookingId;
    //     if (this.qrCodeContainer && reservationBookingId) {
    //         this.qrCodeService.createQrCode(
    //             {
    //                 reservationBookingId: reservationBookingId,
    //                 bookingId: bookingId,
    //             },
    //             this.qrCodeContainer.nativeElement,
    //             { size: '140px' }
    //         );
    //     }
    // }
}
