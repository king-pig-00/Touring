import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    map,
    takeUntil,
    tap,
} from 'rxjs';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {
    ApiB2CModifyBookingService,
    B2CBookingState,
    BookingCancellationRefundAmount,
    CancellationReason,
    ErrorDialogMessages,
    SuccessDialogMessages,
    UIState,
} from '@app/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-cancel-booking-modal',
    templateUrl: './cancel-booking-modal.component.html',
    styleUrls: ['./cancel-booking-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextareaModule,
        CheckboxModule,
        DropdownModule,
        DialogModule,
    ],
})
export class CancelBookingModalComponent {
    bookingState = inject(B2CBookingState);
    apiModifyBookingService = inject(ApiB2CModifyBookingService);
    uiState = inject(UIState);
    private context:
        | {
              cancellationReasons: CancellationReason[];
              reservationBookingId: string;
              userId: string;
              successCallback: () => void;
          }
        | undefined;
    originalBookingAmount = 0;
    estimatedRefundAmount = 0;
    refundPolicyDescription = '';
    selectedRefunds: BookingCancellationRefundAmount[] = [];

    cancelBookingModal$ = this.bookingState.modals$.pipe(
        map((modals) => modals.cancelBooking),
        distinctUntilChanged()
    );
    isLoading$ = new BehaviorSubject<boolean>(false);
    isOpen$ = this.cancelBookingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.cancelBookingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context),
        tap((context) => {
            this.context = context;
            this.calculateEstimatedRefundAmount(0);
        })
    );

    cancellationForm = new FormGroup({
        cancellationReasonId: new FormControl(null, Validators.required),
        notes: new FormControl(''),
        applyRefundPolicy: new FormControl(true),
    });

    private isDestroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.cancellationForm.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((formValue) => {
                if (formValue.cancellationReasonId) {
                    this.calculateEstimatedRefundAmount(
                        formValue.cancellationReasonId
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    submitCancellation(): void {
        // uncomment these if we re-enable the forms in the template
        // const cancellationReasonId =
        //     this.cancellationForm.value.cancellationReasonId;
        // if (!cancellationReasonId) {
        //     this.cancellationForm.controls.cancellationReasonId.markAsDirty();
        //     this.cancellationForm.controls.cancellationReasonId.markAsTouched();
        //     return;
        // }
        const reservationBookingId = this.context?.reservationBookingId;
        if (!this.selectedRefunds || !this.context || !reservationBookingId) {
            this.uiState.openErrorDialog({
                title: ErrorDialogMessages.b2c.manageBooking.cancelBooking
                    .title,
                description:
                    ErrorDialogMessages.b2c.manageBooking.cancelBooking
                        .description,
                buttons: [
                    {
                        text: ErrorDialogMessages.b2c.manageBooking
                            .cancelBooking.buttons.close,
                        onClick: () => {
                            this.close();
                        },
                    },
                ],
            });
            return;
        }
        this.isLoading$.next(true);
        this.bookingState
            .submitCancelBooking(
                {
                    reservationBookingId: reservationBookingId,
                    cancellationReasonId: 0, // we're not passing in any reasonId for guest users, if we want to, set this to cancellationReasonId,
                    applyRefundPolicy: true,
                    notes: '', // we're disabling the user from adding notes, if we want to, set this to this.cancellationForm.value.notes || '',
                    createdBy: this.context.userId,
                    bookingCart: this.selectedRefunds.map((booking) => {
                        return {
                            bookingId: booking.bookingId,
                            refundAmount: booking.refundAmount,
                        };
                    }),
                },
                this.context.successCallback
            )
            .then(() => {
                this.isLoading$.next(false);
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.b2c.manageBooking.cancelBooking
                        .title,
                    description:
                        SuccessDialogMessages.b2c.manageBooking.cancelBooking
                            .description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.b2c.manageBooking
                                .cancelBooking.buttons.close,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            })
            .catch(() => {
                this.isLoading$.next(false);
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.b2c.manageBooking.cancelBooking
                        .title,
                    description:
                        ErrorDialogMessages.b2c.manageBooking.cancelBooking
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.b2c.manageBooking
                                .cancelBooking.buttons.close,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            });
    }

    close(): void {
        this.bookingState.closeCancelBookingModal();
    }

    private calculateEstimatedRefundAmount(selectedReasonId: number) {
        const reservationBookingId = this.context?.reservationBookingId;
        if (reservationBookingId) {
            lastValueFrom(
                this.apiModifyBookingService
                    .getBookingCancellationRefundAmount(
                        reservationBookingId,
                        true,
                        selectedReasonId
                    )
                    .pipe(map((res) => res.data))
            )
                .then((data) => {
                    this.selectedRefunds = data;
                    this.originalBookingAmount = data.reduce((acc, curr) => {
                        acc += curr.bookingTotalCost;
                        return acc;
                    }, 0);
                    this.estimatedRefundAmount = data.reduce((acc, curr) => {
                        acc += curr.refundAmount;
                        return acc;
                    }, 0);
                    // TODO: we might need this to be handled at a tour level
                    this.refundPolicyDescription =
                        data[0].refundPolicyDescription;
                })
                .catch((error) => {
                    this.uiState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.agent.manageBooking
                                  .calculateEstimatedRefundAmount.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.agent.manageBooking
                                      .calculateEstimatedRefundAmount
                                      .description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.agent.manageBooking
                                    .calculateEstimatedRefundAmount.buttons
                                    .close,
                                isPrimary: true,
                                onClick: () => {
                                    // close dialog
                                },
                            },
                        ],
                    });

                    // TODO: need to add some sort of error handling
                });
        }
    }
}
