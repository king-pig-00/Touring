import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
    tap,
} from 'rxjs';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ManageService } from '../../../manage.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {
    ApiAgentModifyBookingService,
    BookingCartAmount,
    CompleteBookingDetails,
    CreditCardExpiredMonthOptions,
    CreditCardExpiredYearOptions,
    CreditCardPatterns,
    ErrorDialogMessages,
    GeneralBookingInfo,
    SuccessDialogMessages,
    UIState,
    inputMasks,
} from '@app/core';
import { CcIdentificationComponent } from '@app/shared';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    standalone: true,
    selector: 'app-credit-card-info-modal',
    templateUrl: './credit-card-info-modal.component.html',
    styleUrls: ['./credit-card-info-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        InputMaskModule,
        InputTextModule,
        CcIdentificationComponent,
        DropdownModule,
    ],
})
export class CreditCardInfoModalComponent {
    manageService = inject(ManageService);
    apiModifyBookingService = inject(ApiAgentModifyBookingService);
    uiState = inject(UIState);
    masks = inputMasks;
    ccYearOptions = CreditCardExpiredYearOptions;
    ccMonthOptions = CreditCardExpiredMonthOptions;
    cardType: string | null = null;
    private context:
        | {
              generalBookingInfo: GeneralBookingInfo;
              updatedTotalBooking: BookingCartAmount;
              formattedBookingDetails: CompleteBookingDetails;
              notes?: string;
          }
        | undefined;

    creditCardInfoModal$ = this.manageService.modals$.pipe(
        map((modals) => modals.creditCardInfo),
        distinctUntilChanged()
    );
    isLoading$ = new BehaviorSubject<boolean>(false);
    isOpen$ = this.creditCardInfoModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.creditCardInfoModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context),
        tap((context) => {
            this.context = context;
        })
    );

    paymentInfoForm = new FormGroup({
        cardHolderName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        cardNumber: new FormControl('', [
            Validators.required,
            Validators.pattern('^[s0-9]*$'),
            Validators.minLength(14),
            Validators.maxLength(16),
        ]),
        expDateMonth: new FormControl('', [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(2),
            Validators.maxLength(2),
        ]),
        expDateYear: new FormControl('', [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(1),
            Validators.maxLength(2),
        ]),
        cardCode: new FormControl('', [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(3),
            Validators.maxLength(4),
        ]),
    });

    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.paymentInfoForm.controls.cardNumber.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((cardNumber) => {
                if (cardNumber && cardNumber.length > 0) {
                    // find card type
                    const matchedPattern = Object.entries(
                        CreditCardPatterns
                    ).find(([key, value]) => {
                        if (value.test(cardNumber)) {
                            return true;
                        }
                        return false;
                    });
                    if (matchedPattern) {
                        this.cardType = matchedPattern[0];
                    } else {
                        this.cardType = null;
                    }
                }
            });
    }
    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    submitUpdateBooking(): void {
        if (!this.context?.formattedBookingDetails) {
            return;
        }
        if (this.paymentInfoForm.invalid) {
            Object.values(this.paymentInfoForm.controls).forEach((control) => {
                control.markAsTouched();
                control.markAsDirty();
            });
            return;
        }
        this.isLoading$.next(true);
        this.manageService
            .submitUpdateBookingWithCreditCardInfo({
                ...this.context?.formattedBookingDetails,
                chargeCreditCard: {
                    cardHolderName:
                        this.paymentInfoForm.value.cardHolderName || '',
                    cardNumber: this.paymentInfoForm.value.cardNumber || '',
                    cardCode: this.paymentInfoForm.value.cardCode || '',
                    expirationDate:
                        `${this.paymentInfoForm.value.expDateMonth
                            ?.toString()
                            .padStart(2, '0')}${
                            this.paymentInfoForm.value.expDateYear
                        }` || '',
                },
            })
            .then(() => {
                this.isLoading$.next(false);
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.agent.manageBooking
                        .modifyBooking.title,
                    description:
                        SuccessDialogMessages.agent.manageBooking.modifyBooking
                            .description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.agent.manageBooking
                                .modifyBooking.buttons.close,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            })
            .catch((err) => {
                const priceChangeError =
                    err?.findIndex((error: string) =>
                        error.toLowerCase()?.includes('tour price is changed')
                    ) >= 0;
                this.isLoading$.next(false);
                if (priceChangeError) {
                    this.uiState.openErrorDialog({
                        title: ErrorDialogMessages.agent.manageBooking
                            .priceChange.title,
                        description:
                            ErrorDialogMessages.agent.manageBooking.priceChange
                                .description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.agent.manageBooking
                                    .priceChange.buttons.close,
                                onClick: () => {},
                            },
                        ],
                    });
                } else {
                    this.uiState.openErrorDialog({
                        title: ErrorDialogMessages.agent.manageBooking
                            .modifyBooking.title,
                        description:
                            ErrorDialogMessages.agent.manageBooking
                                .modifyBooking.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.agent.manageBooking
                                    .modifyBooking.buttons.close,
                                onClick: () => {
                                    this.close();
                                },
                            },
                        ],
                    });
                }
            });
    }

    close(): void {
        this.manageService.closeCreditCardInfoModal();
    }
}
