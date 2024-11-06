import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ApiPickupLocationItem,
    BookingDetails,
    ConfirmationDialogMessages,
    Features,
    QrCodeService,
    ShipByTour,
    TourInventoryDetails,
    TourTimes,
    UIState,
} from '@app/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    startWith,
    takeUntil,
} from 'rxjs';
import { CustomTimePipe } from '../../../shared';
import { ManageService, TourDetailsEdit } from '../../manage.service';
import { ParticipantsPipe, PermissionDirective } from '@app/shared';
import { PickupInformationComponent } from '../pickup-information/pickup-information.component';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-tour-card',
    templateUrl: './tour-card.component.html',
    styleUrls: ['./tour-card.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DividerModule,
        ButtonModule,
        InputNumberModule,
        InputTextModule,
        TooltipModule,
        BadgeModule,
        CustomTimePipe,
        ParticipantsPipe,
        PickupInformationComponent,
        PermissionDirective,
    ],
})
export class TourCardComponent {
    @Input() tour?: {
        originalBookingDetails: BookingDetails;
        bookingDetails: BookingDetails;
        tourDetails: TourInventoryDetails;
        pickupLocations: ApiPickupLocationItem[];
        tourTimes: TourTimes[];
        shipList: ShipByTour[];
        qrcode: string;
    };
    @Input() index = 1;
    // @ViewChild('qrCodeContainer', { static: false }) qrCodeContainer:
    //     | ElementRef
    //     | undefined;

    features = Features;
    qrCodeService = inject(QrCodeService);
    uiState = inject(UIState);
    manageService = inject(ManageService);

    totalPassengersValidator = (editableFieldsFormControl: AbstractControl) => {
        const adults = editableFieldsFormControl.get('bookingAdults')?.value;
        const children =
            editableFieldsFormControl.get('bookingChildren')?.value;
        let error = null;
        const totalParticipants = adults + children;
        if (totalParticipants === 0) {
            error = { totalPassengersIsZero: true };
        }

        const tourInventoryId = this.tour?.bookingDetails?.tourInventoryID;
        if (this.tour?.tourTimes && tourInventoryId) {
            const selectedTourTime = this.tour.tourTimes.find(
                (tourTime) => tourTime.tourInventoryId === tourInventoryId
            );

            if (selectedTourTime && selectedTourTime.availableSeats > 0) {
                // factor in the current participants
                if (
                    this.tour.originalBookingDetails.tourInventoryID ===
                        selectedTourTime.tourInventoryId &&
                    totalParticipants >
                        selectedTourTime.availableSeats +
                            (this.tour.originalBookingDetails.bookingAdults ||
                                0) +
                            (this.tour.originalBookingDetails.bookingChildren ||
                                0)
                ) {
                    error = {
                        ...error,
                        exceededAvailableSeats: true,
                    };
                }
                if (
                    this.tour.originalBookingDetails.tourInventoryID !==
                        selectedTourTime.tourInventoryId &&
                    totalParticipants > selectedTourTime.availableSeats
                ) {
                    error = {
                        ...error,
                        exceededAvailableSeats: true,
                    };
                }
            }
        }

        // mark both fields as dirty so we can display the red error border
        editableFieldsFormControl.get('bookingAdults')?.markAsDirty();
        editableFieldsFormControl.get('bookingAdults')?.setErrors(error);
        editableFieldsFormControl.get('bookingChildren')?.markAsDirty();
        editableFieldsFormControl.get('bookingChildren')?.setErrors(error);
        return error;
    };

    tourDetailsForm = new FormGroup(
        {
            bookingLeadTravelerFirst: new FormControl('', Validators.required),
            bookingLeadTravelerLast: new FormControl('', Validators.required),
            bookingAdults: new FormControl(0),
            bookingChildren: new FormControl(0),
            bookingInfants: new FormControl(0),
        },
        {
            validators: this.totalPassengersValidator,
        }
    );

    alternateTimeDisabled = true;
    alternateArrivalMethodDisabled = true;
    // use this to prevent users adding more users than the available seat for the tour
    participantsLimit: {
        adults: number;
        children: number;
    } = {
        adults: 0,
        children: 0,
    };
    private readonly isDestroyed$ = new Subject<void>();
    status$ = new BehaviorSubject<string>('idle');

    ngOnInit(): void {
        this.tourDetailsForm.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((res) => {
                const bookingId = this.tour?.bookingDetails?.bookingID;
                if (bookingId) {
                    this.manageService.updateTourDetails(
                        bookingId,
                        res as TourDetailsEdit
                    );
                    this.manageService.updateValidation(
                        this.tourDetailsForm.errors
                    );
                }
                this.checkAvailableTimes();
                this.checkAvailableArrivalMethod();
            });
    }

    ngAfterViewInit(): void {
        // if (this.tour?.bookingDetails?.bookingID) {
        //     this.generateQrCode(this.tour.bookingDetails.bookingID.toString());
        // }
    }

    ngOnChanges(): void {
        this.tourDetailsForm.patchValue({
            bookingLeadTravelerFirst: this.tour?.bookingDetails?.leadFirstName,
            bookingLeadTravelerLast: this.tour?.bookingDetails?.leadLastName,
            bookingAdults: this.tour?.bookingDetails?.bookingAdults,
            bookingChildren: this.tour?.bookingDetails?.bookingChildren,
            bookingInfants: this.tour?.bookingDetails?.bookingInfants,
        });
        this.checkAvailableTimes();
        this.checkAvailableArrivalMethod();
        this.handleParticipantsChange();
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next(undefined);
        this.isDestroyed$.complete();
    }

    removeDialog() {
        this.uiState.openConfirmationDialog({
            title: ConfirmationDialogMessages.b2c.manageBooking.removeTour
                .title,
            description:
                ConfirmationDialogMessages.b2c.manageBooking.removeTour
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.b2c.manageBooking
                        .removeTour.buttons.backToBooking,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.b2c.manageBooking
                        .removeTour.buttons.removeTour,
                    onClick: () => {
                        const bookingId = this.tour?.bookingDetails.bookingID;
                        if (bookingId) {
                            this.manageService.removeTour(bookingId);
                        }
                    },
                    isPrimary: false,
                },
            ],
        });
    }

    viewAlternateTimes(): void {
        const bookingId = this.tour?.bookingDetails.bookingID;
        if (bookingId) {
            const formValue = this.tourDetailsForm.getRawValue();
            const totalParticipants =
                (formValue.bookingAdults || 0) +
                (formValue.bookingChildren || 0);
            this.manageService.openModifyTimeModal(
                bookingId,
                totalParticipants
            );
        }
    }

    changeArrivalMethod(): void {
        const bookingId = this.tour?.bookingDetails.bookingID;
        if (bookingId) {
            this.manageService.openModifyCruiseModal(bookingId);
        }
    }

    resendEmail() {
        if (this.tour?.bookingDetails) {
            this.manageService
                .resendEmail(this.tour?.bookingDetails.reservationBookingId)
                .then(() => {
                    this.status$.next('success');
                })
                .catch(() => {
                    this.status$.next('error');
                });
        }
    }

    private checkAvailableArrivalMethod(): void {
        if (!this.tour?.shipList || this.tour?.shipList.length === 1) {
            this.alternateArrivalMethodDisabled = true;
            return;
        }
        this.alternateArrivalMethodDisabled = false;
    }

    private checkAvailableTimes(): void {
        if (!this.tour || !this.tour.tourTimes) {
            this.alternateTimeDisabled = true;
            return;
        }

        const otherAvailableTourTimes = this.tour.tourTimes.filter(
            (bookingTime) =>
                bookingTime.tourInventoryId !==
                this.tour?.originalBookingDetails.tourInventoryID
        );
        if (otherAvailableTourTimes.length === 0) {
            this.alternateTimeDisabled = true;
            return;
        }
        const form = this.tourDetailsForm.getRawValue();
        const totalParticipants =
            (form.bookingAdults || 0) + (form.bookingChildren || 0);
        if (
            otherAvailableTourTimes.filter((bookingTime) => {
                return (
                    bookingTime.availableSeats > 0 &&
                    totalParticipants <= bookingTime.availableSeats
                );
            }).length > 0
        ) {
            this.alternateTimeDisabled = false;
        } else {
            this.alternateTimeDisabled = true;
        }
    }

    private handleParticipantsChange(): void {
        combineLatest([
            this.tourDetailsForm.controls.bookingAdults.valueChanges,
            this.tourDetailsForm.controls.bookingChildren.valueChanges,
        ])
            .pipe(
                startWith([
                    this.tour?.bookingDetails?.bookingAdults,
                    this.tour?.bookingDetails?.bookingChildren,
                ]),
                takeUntil(this.isDestroyed$)
            )
            .subscribe(([adults, children]) => {
                const totalParticipants = (adults || 0) + (children || 0);
                if (this.tour && this.tour.tourTimes) {
                    const tourInventoryId =
                        this.tour?.bookingDetails?.tourInventoryID;
                    const selectedTourTime = this.tour.tourTimes.find(
                        (tourTime) =>
                            tourTime.tourInventoryId === tourInventoryId
                    );
                    const remainingAvailableSeats =
                        (selectedTourTime?.availableSeats || 0) -
                        totalParticipants;
                    this.participantsLimit = {
                        adults: (adults || 0) + remainingAvailableSeats,
                        children: (children || 0) + remainingAvailableSeats,
                    };
                }
            });
    }

    // private generateQrCode(bookingId: string): void {
    //     const reservationBookingId =
    //         this.tour?.bookingDetails.reservationBookingId;
    //     if (this.qrCodeContainer && reservationBookingId) {
    //         this.qrCodeService.createQrCode(
    //             {
    //                 reservationBookingId: reservationBookingId,
    //                 bookingId: bookingId,
    //             },
    //             this.qrCodeContainer.nativeElement,
    //             { size: '200px' }
    //         );
    //     }
    // }
}
