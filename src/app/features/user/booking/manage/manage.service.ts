import { Injectable, inject } from '@angular/core';
import {
    BehaviorSubject,
    catchError,
    forkJoin,
    lastValueFrom,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';
import {
    ApiAgentService,
    ApiB2CService,
    ApiTourInventoryService,
    B2CBookingState,
    BookingDetails,
    ErrorDialogMessages,
    SuccessDialogMessages,
    TourInventoryDetails,
    UIState,
    toModifyBookingDetails,
    ApiB2CModifyBookingService,
    AuthService,
    GeneralBookingInfo,
    getGeneralBookingInfo,
    AdditionalBookingDetails,
    BookingCartAmount,
    CompleteBookingDetails,
    ApiPickupLocationItem,
    TourTimes,
    ShipByTour,
} from '@app/core';
import { Router } from '@angular/router';

export interface PassengerInformation {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    shipCompanyName: string;
    shipName: string;
}

const passengerInformationInitial: PassengerInformation = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    shipCompanyName: '',
    shipName: '',
};

export interface TourDetailsEdit {
    bookingLeadTravelerFirst: string;
    bookingLeadTravelerLast: string;
    bookingAdults: number;
    bookingChildren: number;
    bookingInfants: number;
    bookingPickUp?: string;
}
@Injectable()
export class ManageService {
    router = inject(Router);
    tourInventoryService = inject(ApiTourInventoryService);
    agentService = inject(ApiAgentService);
    bookingState = inject(B2CBookingState);
    apiB2CService = inject(ApiB2CService);
    apiModifyBookingService = inject(ApiB2CModifyBookingService);
    uiState = inject(UIState);
    authService = inject(AuthService);
    booking$ = new BehaviorSubject<
        | {
              originalBookingDetails: BookingDetails;
              bookingDetails: BookingDetails;
              tourDetails: TourInventoryDetails;
              additionalBookingDetails?: AdditionalBookingDetails | undefined;
              pickupLocations: ApiPickupLocationItem[];
              tourTimes: TourTimes[];
              shipList: ShipByTour[];
          }[]
        | undefined
    >(undefined);
    bookingGeneralInfo$ = new BehaviorSubject<GeneralBookingInfo | undefined>(
        undefined
    );
    tourDetailsEdit$ = new BehaviorSubject<Record<string, TourDetailsEdit>>({});
    isLoading$ = new BehaviorSubject<boolean>(false);
    passengerInformation$ = new BehaviorSubject<PassengerInformation>(
        passengerInformationInitial
    );
    bookingNotes$ = new BehaviorSubject<string>('');

    modals$ = new BehaviorSubject<{
        creditCardInfo: {
            isOpen: boolean;
            context?: {
                generalBookingInfo: GeneralBookingInfo;
                updatedTotalBooking: BookingCartAmount;
                formattedBookingDetails: CompleteBookingDetails;
                notes?: string;
            };
        };
        modifyCruise: {
            isOpen: boolean;
            context?: {
                generalBookingInfo: GeneralBookingInfo;
                bookingDetails: BookingDetails;
                shipList: ShipByTour[];
            };
        };
        modifyTime: {
            isOpen: boolean;
            context?: {
                originalBookingDetails: BookingDetails;
                generalBookingInfo: GeneralBookingInfo;
                bookingDetails: BookingDetails;
                availableTimes: TourTimes[];
                totalParticipants: number;
            };
        };
    }>({
        creditCardInfo: {
            isOpen: false,
        },
        modifyCruise: {
            isOpen: false,
        },
        modifyTime: {
            isOpen: false,
        },
    });
    hasUnsavedChanges$ = new BehaviorSubject<boolean>(false);

    init(): void {
        this.updateHasUnsavedChanges(false);
    }

    getBooking(reservationBookingId: string): void {
        this.isLoading$.next(true);
        this.uiState.showLoadingIndicator();
        this.tourInventoryService
            .getBooking(reservationBookingId)
            .pipe(
                map((res) => res.data),
                switchMap((bookingDetails) => {
                    return this.apiModifyBookingService
                        .getBookingChargeAmount({
                            reservationBookingId: reservationBookingId,
                            discountId: 0,
                            bookingCart: bookingDetails.map((booking) => ({
                                companyId: booking.companyUniqueID,
                                shipCompanyId: booking.shipCompanyId,
                                shipId: booking.shipId,
                                bookingTime: booking.bookingTime,
                                pickUpLocation:
                                    booking.pickupLocationName || '',
                                leadFirstName: booking.leadFirstName,
                                leadLastName: booking.leadLastName,
                                bookingId: booking.bookingID,
                                bookingDate: booking.bookingDate,
                                tourInventoryId: booking.tourInventoryID,
                                tourId: booking.tourID,
                                adults: booking.bookingAdults,
                                children: booking.bookingChildren,
                                infants: booking.bookingInfants,
                                addons: [],
                            })),
                            bookingFirstName: '',
                            bookingLastName: '',
                            email: '',
                            agentsGuestEmail: '',
                            primaryPhoneNumber: '',
                            secondaryPhoneNumber: '',
                            shippingFirstName: '',
                            shippingLastName: '',
                            bookingNotes: '',
                            address: '',
                            city: '',
                            zipCode: '',
                            countryId: 0,
                            stateId: 0,
                            giftCardPIN: '',
                            giftCardCode: '',
                            createdBy: '',
                            partnerId: 0,
                            paymentType: '',
                            chargeCreditCard: {
                                cardHolderName: '',
                                cardNumber: '',
                                cardCode: '',
                                expirationDate: '',
                            },
                        })
                        .pipe(
                            map((res) => res.data),
                            tap((bookingAmount) => {
                                this.bookingGeneralInfo$.next(
                                    getGeneralBookingInfo(
                                        reservationBookingId,
                                        bookingDetails?.[0],
                                        bookingAmount?.[0]
                                    )
                                );
                            }),
                            map(() => {
                                return bookingDetails;
                            })
                        );
                }),
                switchMap((bookingDetails) => {
                    return forkJoin(
                        bookingDetails.map((booking) =>
                            forkJoin([
                                this.tourInventoryService.getTourDetail(
                                    booking.tourInventoryID,
                                    false
                                ),
                                this.tourInventoryService.getPickUpLocationList(
                                    booking.tourID,
                                    !(
                                        booking.shipId == null ||
                                        booking.shipCompanyId < 0
                                    )
                                ),
                                this.tourInventoryService.getShipListByTourId(
                                    booking.companyUniqueID,
                                    booking.tourID,
                                    booking.bookingDate
                                ),
                                this.tourInventoryService.getTourTimes(
                                    booking.companyUniqueID,
                                    booking.tourID,
                                    null,
                                    (booking.bookingAdults || 0) +
                                        (booking.bookingChildren || 0),
                                    booking.bookingDate
                                ),
                            ]).pipe(
                                map(
                                    ([
                                        tourInventoryDetails,
                                        pickupLocationList,
                                        shipList,
                                        alternateTourTimes,
                                    ]) => {
                                        this.uiState.hideLoadingIndicator();
                                        return {
                                            originalBookingDetails: booking,
                                            bookingDetails: booking,
                                            tourDetails:
                                                tourInventoryDetails.data,
                                            pickupLocations:
                                                pickupLocationList.data || [],
                                            shipList: shipList.data || [],
                                            tourTimes:
                                                alternateTourTimes.data || [],
                                        };
                                    }
                                )
                            )
                        )
                    );
                }),
                catchError(() => {
                    this.uiState.hideLoadingIndicator();
                    this.uiState.openErrorDialog({
                        title: ErrorDialogMessages.b2c.manageBooking
                            .loadBookingError.title,
                        description:
                            ErrorDialogMessages.b2c.manageBooking
                                .loadBookingError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.b2c.manageBooking
                                    .loadBookingError.buttons.close,
                                onClick: () => {
                                    this.router.navigate(['/agent/booking']);
                                },
                            },
                        ],
                    });
                    return of(undefined);
                })
            )
            .subscribe((res) => {
                this.isLoading$.next(false);
                if (res) {
                    // we're currently only supporting a single booking note per booking
                    // so everytime we update the notes, it updates all notes of the tours in the booking
                    // we can default it to the first one ofr now
                    this.bookingNotes$.next(
                        res?.[0]?.bookingDetails?.bookingNotes || ''
                    );
                    this.booking$.next(res);
                }
            });
    }
    updatePassengerInformation(updatedFields: PassengerInformation): void {
        this.passengerInformation$.next(updatedFields);
    }

    private validationErrors$ = new BehaviorSubject<Record<
        string,
        boolean
    > | null>(null);

    updateValidation(errors: Record<string, boolean> | null): void {
        this.validationErrors$.next(errors);
    }

    resendEmail(bookingID: string) {
        return lastValueFrom(
            this.tourInventoryService.resendEmail(bookingID, false)
        )
            .then(() => {
                return Promise;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    updateTourDetails(
        bookingId: number,
        updatedFields: Partial<TourDetailsEdit>
    ): void {
        this.updateHasUnsavedChanges(true);
        this.tourDetailsEdit$.next({
            ...this.tourDetailsEdit$.getValue(),
            [bookingId]: {
                ...(this.tourDetailsEdit$.getValue()[bookingId]
                    ? this.tourDetailsEdit$.getValue()[bookingId]
                    : {}),
                ...updatedFields,
            },
        });
    }

    removeTour(bookingId: number): void {
        this.updateHasUnsavedChanges(true);
        const bookings = this.booking$
            .getValue()
            ?.filter(
                (booking) => booking.bookingDetails.bookingID !== bookingId
            );

        if (bookings && bookings.length > 0) {
            this.booking$.next(bookings);
            const tourDetails = this.tourDetailsEdit$.getValue();
            delete tourDetails[bookingId];
            this.tourDetailsEdit$.next({ ...tourDetails });
        } else {
            // if the cart is empty, trigger booking cancellation flow
            const reservationBookingId =
                this.bookingGeneralInfo$.getValue()?.reservationBookingId;
            if (reservationBookingId) {
                this.bookingState.cancelBooking(reservationBookingId, () => {
                    this.getBooking(reservationBookingId);
                });
            }
        }
    }

    updateBookingNotes(updatedText: string): void {
        this.updateHasUnsavedChanges(true);
        this.bookingNotes$.next(updatedText);
    }

    updateTourTime(
        bookingId: number,
        tourInventoryId: number,
        tourTime: string
    ): Promise<void> {
        this.updateHasUnsavedChanges(true);
        // original booking values
        const bookings = this.booking$.getValue();
        const updatedBookings =
            bookings?.map((booking) => {
                if (booking.bookingDetails.bookingID == bookingId) {
                    return {
                        ...booking,
                        bookingDetails: {
                            ...booking.bookingDetails,
                            ...this.getUpdatedFields(booking.bookingDetails),
                            tourInventoryID: tourInventoryId,
                            bookingTime: tourTime,
                        },
                        tourDetails: {
                            ...booking.tourDetails,
                            tourInventoryID: tourInventoryId,
                            tourInventoryTime: tourTime,
                        },
                    };
                }
                return booking;
            }) || [];
        this.booking$.next(updatedBookings);
        return Promise.resolve();
    }

    updateShipInformation(
        bookingId: number,
        updatedShip: ShipByTour
    ): Promise<void> {
        this.updateHasUnsavedChanges(true);
        // original booking values
        const bookings = this.booking$.getValue();
        const updatedBookings =
            bookings?.map((booking) => {
                if (booking.bookingDetails.bookingID == bookingId) {
                    return {
                        ...booking,
                        bookingDetails: {
                            ...booking.bookingDetails,
                            ...this.getUpdatedFields(booking.bookingDetails),
                            shipId: updatedShip.shipId || 0,
                            shipName: updatedShip.shipName,
                            shipCompanyId: updatedShip.shipCompanyId || 0,
                            shipCompanyName: updatedShip.shipCompanyName,
                        },
                    };
                }
                return booking;
            }) || [];
        this.booking$.next(updatedBookings);
        return Promise.resolve();
    }

    updateBooking(): void {
        const validationErrors = this.validationErrors$.getValue();
        if (validationErrors) {
            if ('exceededAvailableSeats' in validationErrors) {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.public.cart
                        .participantsExceedSeatsAvailable.title,
                    description:
                        ErrorDialogMessages.public.cart
                            .participantsExceedSeatsAvailable.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.public.cart
                                .participantsExceedSeatsAvailable.buttons
                                .backToCart,
                            onClick: () => {},
                            isPrimary: true,
                        },
                    ],
                });
            } else if ('totalPassengersIsZero' in validationErrors) {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.public.cart.invalidParticipants
                        .title,
                    description:
                        ErrorDialogMessages.public.cart.invalidParticipants
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.public.cart
                                .invalidParticipants.buttons.backToCart,
                            onClick: () => {},
                            isPrimary: true,
                        },
                    ],
                });
            } else {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.b2c.manageBooking
                        .modifyBookingIncompleteForm.title,
                    description:
                        ErrorDialogMessages.b2c.manageBooking
                            .modifyBookingIncompleteForm.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.b2c.manageBooking
                                .modifyBookingIncompleteForm.buttons.close,
                            onClick: () => {},
                            isPrimary: true,
                        },
                    ],
                });
            }

            return;
        }
        this.uiState.showLoadingIndicator();
        // original booking values
        const bookings = this.booking$.getValue();

        // any edits created by the user
        const tourDetails = this.tourDetailsEdit$.getValue();

        const updatedBookings = bookings?.map((booking) => {
            if (tourDetails[booking.bookingDetails.bookingID]) {
                return {
                    ...booking,
                    bookingDetails: {
                        ...booking.bookingDetails,
                        ...this.getUpdatedFields(booking.bookingDetails),
                    },
                };
            }
            return booking;
        });

        const passengerInformation = this.passengerInformation$.getValue();
        const bookingNotes = this.bookingNotes$.getValue();
        const generalBookingInfo = this.bookingGeneralInfo$.getValue();
        const userId = this.authService.getUserId();
        if (updatedBookings && generalBookingInfo && userId) {
            const updatedBooking = {
                generalBookingInfo: generalBookingInfo,
                updatedBookings: updatedBookings.map((booking) => ({
                    bookingDetails: booking.bookingDetails,
                    additionalDetails: booking.tourDetails,
                })),
                bookingNotes: bookingNotes,
                passengerInformation: passengerInformation,
                userId: userId,
            };

            // Credit Card Flow
            // check for void vs refund
            // if its void, error out as you can't modify the booking,
            // only cancel the entire booking
            lastValueFrom(
                this.apiModifyBookingService.getBookingTransactionStatus(
                    generalBookingInfo.reservationBookingId
                )
            ).then((transactionStatus) => {
                lastValueFrom(
                    this.apiModifyBookingService.getBookingChargeAmount(
                        toModifyBookingDetails(updatedBooking)
                    )
                ).then((bookingAmount) => {
                    if (bookingAmount.success === false) {
                        if (
                            bookingAmount?.errors?.find((error: string) =>
                                error
                                    .toLowerCase()
                                    ?.includes('tour price is changed')
                            )
                        ) {
                            this.uiState.hideLoadingIndicator();
                            this.uiState.openErrorDialog({
                                title: ErrorDialogMessages.agent.manageBooking
                                    .priceChange.title,
                                description:
                                    ErrorDialogMessages.agent.manageBooking
                                        .priceChange.description,
                                buttons: [
                                    {
                                        text: ErrorDialogMessages.agent
                                            .manageBooking.priceChange.buttons
                                            .close,
                                        onClick: () => {},
                                    },
                                ],
                            });
                        } else {
                            this.uiState.hideLoadingIndicator();
                            this.displayGenericErrorDialog();
                        }
                        return;
                    }
                    const updatedTotalBooking = bookingAmount.data?.[0];
                    const existingTotalBooking =
                        generalBookingInfo.bookingAmount;
                    if (
                        updatedTotalBooking.totalCost ===
                        existingTotalBooking.totalCost
                    ) {
                        // no monetary change - this is possibly only updating particpant
                        // names or other values that don't impact the total price
                        // we'll let this through regardless of the transaction status

                        this.submitUpdateBooking({
                            generalBookingInfo: generalBookingInfo,
                            updatedTotalBooking: updatedTotalBooking,
                            formattedBookingDetails:
                                toModifyBookingDetails(updatedBooking),
                        });
                    } else {
                        // error out here
                        if (!transactionStatus?.data) {
                            this.uiState.hideLoadingIndicator();
                            this.uiState.openErrorDialog({
                                title: ErrorDialogMessages.b2c.manageBooking
                                    .modifyBooking.title,
                                description:
                                    ErrorDialogMessages.b2c.manageBooking
                                        .modifyBooking.description,
                                buttons: [
                                    {
                                        text: ErrorDialogMessages.b2c
                                            .manageBooking.modifyBooking.buttons
                                            .close,
                                        onClick: () => {},
                                    },
                                ],
                            });
                        }
                        // Only Eligible For Void By Credit Card Processor
                        else if (
                            transactionStatus?.data.includes(
                                'Only Eligible For Void'
                            ) &&
                            updatedTotalBooking.totalCost <
                                generalBookingInfo.bookingAmount.totalCost
                        ) {
                            // not eligible for refund, so we're not going to allow reducing the number of guests
                            this.uiState.hideLoadingIndicator();
                            this.uiState.openErrorDialog({
                                title: ErrorDialogMessages.b2c.manageBooking
                                    .modifyBookingVoidEligible.title,
                                description:
                                    ErrorDialogMessages.b2c.manageBooking
                                        .modifyBookingVoidEligible.description,
                                buttons: [
                                    {
                                        text: ErrorDialogMessages.b2c
                                            .manageBooking
                                            .modifyBookingVoidEligible.buttons
                                            .close,
                                        onClick: () => {},
                                    },
                                ],
                            });
                        } else {
                            // eligible for refund, so we'll allow modifying the booking
                            if (
                                updatedTotalBooking.totalCost >
                                generalBookingInfo.bookingAmount.totalCost
                            ) {
                                this.uiState.hideLoadingIndicator();
                                // if modification results in a higher total amount,
                                // we need to send credit card information so the additional
                                // amount can be charged
                                this.openCreditCardInfoModal({
                                    generalBookingInfo: generalBookingInfo,
                                    updatedTotalBooking: updatedTotalBooking,
                                    formattedBookingDetails:
                                        toModifyBookingDetails(updatedBooking),
                                });
                            } else {
                                // this will be a refund situation, so no need to ask for
                                // credit card information
                                this.submitUpdateBooking({
                                    generalBookingInfo: generalBookingInfo,
                                    updatedTotalBooking: updatedTotalBooking,
                                    formattedBookingDetails:
                                        toModifyBookingDetails(updatedBooking),
                                });
                            }
                        }
                    }
                });
            });
        }
    }

    submitUpdateBooking({
        generalBookingInfo,
        updatedTotalBooking,
        formattedBookingDetails,
    }: {
        generalBookingInfo?: GeneralBookingInfo;
        updatedTotalBooking?: BookingCartAmount;
        formattedBookingDetails: CompleteBookingDetails;
    }): void {
        lastValueFrom(
            this.apiModifyBookingService.updateBooking(formattedBookingDetails)
        )
            .then((res) => {
                if (
                    res.success === false ||
                    (res.errors && res.errors?.length > 0)
                ) {
                    throw res.errors;
                }
                this.uiState.hideLoadingIndicator();
                const reservationBookingId =
                    this.bookingGeneralInfo$.getValue()?.reservationBookingId;
                if (reservationBookingId) {
                    this.getBooking(reservationBookingId);
                }
                this.updateHasUnsavedChanges(false);
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.b2c.manageBooking.modifyBooking
                        .title,
                    description:
                        SuccessDialogMessages.b2c.manageBooking.modifyBooking
                            .description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.b2c.manageBooking
                                .modifyBooking.buttons.close,
                            onClick: () => {
                                // close
                            },
                        },
                    ],
                });
            })
            .catch((errors) => {
                this.uiState.hideLoadingIndicator();
                try {
                    const creditCardRequiredError = errors?.find(
                        (error: string) =>
                            error
                                .toLowerCase()
                                ?.includes('credit card required')
                    );
                    const priceChangeError = errors?.find((error: string) =>
                        error.toLowerCase()?.includes('tour price is changed')
                    );
                    if (
                        creditCardRequiredError &&
                        generalBookingInfo &&
                        updatedTotalBooking
                    ) {
                        this.openCreditCardInfoModal({
                            generalBookingInfo: generalBookingInfo,
                            updatedTotalBooking: updatedTotalBooking,
                            formattedBookingDetails: formattedBookingDetails,
                            notes: creditCardRequiredError || '',
                        });
                    } else if (
                        priceChangeError &&
                        generalBookingInfo &&
                        updatedTotalBooking
                    ) {
                        this.uiState.openErrorDialog({
                            title: ErrorDialogMessages.agent.manageBooking
                                .priceChange.title,
                            description:
                                ErrorDialogMessages.agent.manageBooking
                                    .priceChange.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages.agent
                                        .manageBooking.priceChange.buttons
                                        .close,
                                    onClick: () => {},
                                },
                            ],
                        });
                    } else {
                        this.displayGenericErrorDialog();
                    }
                } catch (error) {
                    this.displayGenericErrorDialog();
                }
            });
    }
    private displayGenericErrorDialog(): void {
        this.uiState.openErrorDialog({
            title: ErrorDialogMessages.b2c.manageBooking.modifyBooking.title,
            description:
                ErrorDialogMessages.b2c.manageBooking.modifyBooking.description,
            buttons: [
                {
                    text: ErrorDialogMessages.b2c.manageBooking.modifyBooking
                        .buttons.close,
                    onClick: () => {},
                },
            ],
        });
    }

    submitUpdateBookingWithCreditCardInfo(
        bookingDetails: CompleteBookingDetails
    ): Promise<void> {
        return lastValueFrom(
            this.apiModifyBookingService.updateBooking(bookingDetails)
        )
            .then((res) => {
                if (
                    res.success === false ||
                    (res.errors && res.errors?.length > 0)
                ) {
                    throw res.errors;
                }
                const reservationBookingId =
                    this.bookingGeneralInfo$.getValue()?.reservationBookingId;
                if (reservationBookingId) {
                    this.getBooking(reservationBookingId);
                }
                this.updateHasUnsavedChanges(false);
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.openErrorDialog({
                    title: error?.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.agent.manageBooking
                              .submitUpdateBookingWithCreditCardInfo.title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.agent.manageBooking
                                  .submitUpdateBookingWithCreditCardInfo
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.agent.manageBooking
                                .submitUpdateBookingWithCreditCardInfo.buttons
                                .close,
                            isPrimary: true,
                            onClick: () => {
                                // close dialog
                            },
                        },
                    ],
                });

                return Promise.reject(error);
            });
    }

    openCreditCardInfoModal(context: {
        generalBookingInfo: GeneralBookingInfo;
        updatedTotalBooking: BookingCartAmount;
        formattedBookingDetails: CompleteBookingDetails;
        notes?: string;
    }): void {
        const generalBookingInfo = this.bookingGeneralInfo$.getValue();
        if (!generalBookingInfo) {
            return;
        }
        this.modals$.next({
            ...this.modals$.getValue(),
            creditCardInfo: {
                isOpen: true,
                context: context,
            },
        });
    }

    closeCreditCardInfoModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            creditCardInfo: {
                isOpen: false,
            },
        });
    }

    openModifyCruiseModal(bookingId: number): void {
        const generalBookingInfo = this.bookingGeneralInfo$.getValue();
        const booking = this.booking$
            .getValue()
            ?.find((booking) => booking.bookingDetails.bookingID === bookingId);
        if (!generalBookingInfo || !booking) {
            return;
        }
        this.modals$.next({
            ...this.modals$.getValue(),
            modifyCruise: {
                isOpen: true,
                context: {
                    shipList: booking.shipList || [],
                    bookingDetails: booking.bookingDetails,
                    generalBookingInfo: generalBookingInfo,
                    // userId: this.authService.getUserId() || '',
                },
            },
        });
    }

    closeModifyCruiseModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            modifyCruise: {
                isOpen: false,
            },
        });
    }

    openModifyTimeModal(bookingId: number, totalParticipants: number): void {
        const generalBookingInfo = this.bookingGeneralInfo$.getValue();
        const booking = this.booking$
            .getValue()
            ?.find((booking) => booking.bookingDetails.bookingID === bookingId);
        if (!generalBookingInfo || !booking) {
            return;
        }
        this.modals$.next({
            ...this.modals$.getValue(),
            modifyTime: {
                isOpen: true,
                context: {
                    originalBookingDetails: booking.originalBookingDetails,
                    availableTimes: booking.tourTimes || [],
                    totalParticipants: totalParticipants || 0,
                    bookingDetails: booking.bookingDetails,
                    generalBookingInfo: generalBookingInfo,
                },
            },
        });
    }

    closeModifyTimeModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            modifyTime: {
                isOpen: false,
            },
        });
    }

    cancelBooking(reservationBookingId: string): void {
        this.bookingState.cancelBooking(reservationBookingId, () => {
            this.getBooking(reservationBookingId);
            this.updateHasUnsavedChanges(false);
        });
    }

    private getUpdatedFields(bookingDetails: BookingDetails): Partial<any> {
        const tourDetails = this.tourDetailsEdit$.getValue();
        const updatedTourDetails = tourDetails[bookingDetails.bookingID];
        return {
            leadFirstName:
                updatedTourDetails?.bookingLeadTravelerFirst ||
                bookingDetails?.leadFirstName ||
                '',
            leadLastName:
                updatedTourDetails?.bookingLeadTravelerLast ||
                bookingDetails?.leadLastName ||
                '',
            bookingAdults:
                updatedTourDetails?.bookingAdults ||
                bookingDetails?.bookingAdults ||
                0,
            adults:
                updatedTourDetails?.bookingAdults ||
                bookingDetails?.bookingAdults ||
                0,
            bookingChildren:
                updatedTourDetails?.bookingChildren ||
                bookingDetails?.bookingChildren ||
                0,
            children:
                updatedTourDetails?.bookingChildren ||
                bookingDetails?.bookingChildren ||
                0,
            bookingInfants:
                updatedTourDetails?.bookingInfants ||
                bookingDetails?.bookingInfants ||
                0,
            infants:
                updatedTourDetails?.bookingInfants ||
                bookingDetails?.bookingInfants ||
                0,
            bookingPickUp:
                updatedTourDetails?.bookingPickUp ||
                bookingDetails?.bookingPickUp ||
                '',
        };
    }

    private updateHasUnsavedChanges(hasUnsavedChanges: boolean): void {
        this.hasUnsavedChanges$.next(hasUnsavedChanges);
    }
}
