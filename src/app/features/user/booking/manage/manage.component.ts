import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import {
    B2CBookingState,
    ConfirmationDialogMessages,
    QrCodeService,
    UIState,
    UnsavedComponent,
} from '@app/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
    CreditCardInfoModalComponent,
    ModifyCruiseModalComponent,
    ModifyTimeModalComponent,
    NotesComponent,
    PickupInformationComponent,
    TourCardComponent,
} from './components';
import { ButtonModule } from 'primeng/button';
import { ManageService } from './manage.service';
import { Observable, map } from 'rxjs';
import {
    CancelBookingModalComponent,
    BookingSummaryComponent,
} from '../shared';

@Component({
    standalone: true,
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['../../user-dashboard.scss', './manage.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        TourCardComponent,
        NotesComponent,
        PickupInformationComponent,
        CancelBookingModalComponent,
        CreditCardInfoModalComponent,
        ModifyCruiseModalComponent,
        ModifyTimeModalComponent,
        BookingSummaryComponent,
    ],
    providers: [ManageService],
})
export class ManageComponent implements UnsavedComponent {
    activatedRoute = inject(ActivatedRoute);
    bookingState = inject(B2CBookingState);
    manageService = inject(ManageService);
    router = inject(Router);
    uiState = inject(UIState);
    qrCodeService = inject(QrCodeService);
    booking$ = this.manageService.booking$.pipe(
        map((bookings) =>
            bookings?.map((booking) => {
                return {
                    ...booking,
                    qrcode: this.qrCodeService.generateQrCodeUrl(
                        booking.bookingDetails.reservationBookingId,
                        `${booking.bookingDetails.bookingID}`
                    ),
                };
            })
        )
    );
    bookingSummary$ = this.booking$.pipe(
        map((bookings) => {
            return this.bookingState.formatBookings(
                bookings?.map((booking) => booking.bookingDetails) || [],
                false
            )?.[0];

            // const formattedBookingDetails: B2CBookingGroup = {
            //     reservationBookingId:
            //         booking?.bookingDetails?.reservationBookingId || '',
            //     bookingAmount:
            //         booking?.bookingDetails?.bookingAmountDetail
            //             ?.bookingAmount || 0,
            //     tax: booking?.bookingDetails?.bookingAmountDetail?.tax || 0,
            //     fee: booking?.bookingDetails?.bookingAmountDetail?.fee || 0,
            //     discount:
            //         booking?.bookingDetails?.bookingAmountDetail?.discount || 0,
            //     totalCost:
            //         booking?.bookingDetails?.bookingAmountDetail?.totalCost ||
            //         0,
            //     accountType: booking?.bookingDetails?.accountType || '',
            //     bookings: bookings?.map((entry) => entry.bookingDetails) || [],
            //     cancelled: false,
            // };
            // return formattedBookingDetails;
        })
    );
    isActive$ = this.manageService.bookingGeneralInfo$.pipe(
        map((bookingGeneralInfo) => bookingGeneralInfo?.isActive)
    );
    reservationBookingId = '';
    hasUnsavedChanges$ = this.manageService.hasUnsavedChanges$;

    @HostListener('window:beforeunload', ['$event'])
    canDeactivate($event: any): Observable<boolean> | boolean {
        // returning true will navigate without confirmation
        // returning false will show a confirm dialog before navigating away

        if (this.hasUnsavedChanges$.getValue()) {
            $event.returnValue = 'You have unsaved changes';
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.reservationBookingId =
            this.activatedRoute.snapshot.paramMap.get('id') || '';
        if (this.reservationBookingId) {
            this.manageService.getBooking(this.reservationBookingId);
        }
        this.manageService.init();
    }

    cancel(): void {
        this.uiState.openConfirmationDialog({
            title: ConfirmationDialogMessages.b2c.manageBooking.cancelOrder
                .title,
            description:
                ConfirmationDialogMessages.b2c.manageBooking.cancelOrder
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.b2c.manageBooking
                        .cancelOrder.buttons.backToBooking,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.b2c.manageBooking
                        .cancelOrder.buttons.cancelOrderAnyways,
                    onClick: () => {
                        this.manageService.cancelBooking(
                            this.reservationBookingId
                        );
                    },
                    isPrimary: false,
                },
            ],
        });
    }

    save(): void {
        this.uiState.openConfirmationDialog({
            title: ConfirmationDialogMessages.b2c.manageBooking.modifyBooking
                .title,
            description:
                ConfirmationDialogMessages.b2c.manageBooking.modifyBooking
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.b2c.manageBooking
                        .modifyBooking.buttons.backToBooking,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.b2c.manageBooking
                        .modifyBooking.buttons.saveOrder,
                    onClick: () => {
                        this.manageService.updateBooking();
                    },
                    isPrimary: false,
                },
            ],
        });
    }
}
