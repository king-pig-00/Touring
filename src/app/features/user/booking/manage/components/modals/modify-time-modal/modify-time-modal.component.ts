import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ManageService } from '../../../manage.service';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {
    BookingDetails,
    GeneralBookingInfo,
    TourTimes,
    UIState,
} from '@app/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TimeSlotComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-modify-time-modal',
    templateUrl: './modify-time-modal.component.html',
    styleUrls: ['./modify-time-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        SelectButtonModule,
        ButtonModule,
        DropdownModule,
        DialogModule,
        TimeSlotComponent,
    ],
})
export class ModifyTimeModalComponent {
    manageService = inject(ManageService);
    uiState = inject(UIState);
    private context:
        | {
              originalBookingDetails: BookingDetails;
              availableTimes: TourTimes[];
              bookingDetails: BookingDetails;
              generalBookingInfo: GeneralBookingInfo;
              totalParticipants: number;
          }
        | undefined;

    modifyTimeModal$ = this.manageService.modals$.pipe(
        map((modals) => modals.modifyTime),
        distinctUntilChanged()
    );
    status$ = new BehaviorSubject<'idle' | 'loading' | 'success' | 'error'>(
        'idle'
    );
    isOpen$ = this.modifyTimeModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.modifyTimeModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context),
        tap((context) => {
            this.selectedTourInventoryId =
                context?.bookingDetails.tourInventoryID;
            this.context = context;
            this.totalParticipants =
                context?.totalParticipants ||
                (context?.bookingDetails.bookingAdults || 0) +
                    (context?.bookingDetails.bookingChildren || 0);
            this.availableTimes =
                context?.availableTimes.map((time) => {
                    return {
                        ...time,
                        disabled: this.getTimeSlotIsDisabled(time),
                    };
                }) || [];
        })
    );
    availableTimes: (TourTimes & { disabled: boolean })[] = [];
    totalParticipants = 0;

    selectedTourInventoryId: number | undefined = undefined;

    updateTime(): void {
        if (
            this.selectedTourInventoryId &&
            this.selectedTourInventoryId !==
                this.context?.bookingDetails.tourInventoryID &&
            this.context?.bookingDetails.bookingID
        ) {
            this.status$.next('loading');
            this.manageService
                .updateTourTime(
                    this.context?.bookingDetails.bookingID,
                    this.selectedTourInventoryId,
                    this.availableTimes.find(
                        (time) =>
                            time.tourInventoryId ===
                            this.selectedTourInventoryId
                    )?.tourInventoryTime || ''
                )
                .then(() => {
                    this.close();
                })
                .catch(() => {
                    this.status$.next('error');
                });
        } else {
            // if they're the same, close the modal without updating
            this.close();
        }
    }

    close(): void {
        this.status$.next('idle');
        this.manageService.closeModifyTimeModal();
    }

    private getTimeSlotIsDisabled(time: TourTimes): boolean {
        if (!this.context || time.availableSeats === 0) {
            return true;
        }
        if (
            this.context.originalBookingDetails.tourInventoryID ===
                time.tourInventoryId &&
            (this.context.originalBookingDetails.bookingAdults || 0) +
                (this.context.originalBookingDetails.bookingChildren || 0) >
                time.availableSeats
        ) {
            return true;
        }
        if (
            this.context.originalBookingDetails.tourInventoryID !==
                time.tourInventoryId &&
            this.totalParticipants > time.availableSeats
        ) {
            return true;
        }
        return false;
    }
}
