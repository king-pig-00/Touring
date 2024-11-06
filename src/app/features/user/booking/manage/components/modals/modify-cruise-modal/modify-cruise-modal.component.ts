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
    ShipByTour,
    UIState,
} from '@app/core';

@Component({
    standalone: true,
    selector: 'app-modify-cruise-modal',
    templateUrl: './modify-cruise-modal.component.html',
    styleUrls: ['./modify-cruise-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DropdownModule,
        DialogModule,
    ],
})
export class ModifyCruiseModalComponent {
    manageService = inject(ManageService);
    uiState = inject(UIState);
    private context:
        | {
              shipList: ShipByTour[];
              bookingDetails: BookingDetails;
              generalBookingInfo: GeneralBookingInfo;
          }
        | undefined;

    modifyCruiseModal$ = this.manageService.modals$.pipe(
        map((modals) => modals.modifyCruise),
        distinctUntilChanged()
    );
    status$ = new BehaviorSubject<'idle' | 'loading' | 'success' | 'error'>(
        'idle'
    );
    isOpen$ = this.modifyCruiseModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.modifyCruiseModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context),
        tap((context) => {
            this.selectedShipId = context?.bookingDetails.shipId || null;
            this.context = context;
        })
    );

    selectedShipId: number | null = null;

    updateCruise(): void {
        if (
            this.selectedShipId !== this.context?.bookingDetails.shipId &&
            this.context?.bookingDetails.bookingID
        ) {
            this.status$.next('loading');
            const selectedShip = this.context?.shipList.find(
                (ship) => ship.shipId === this.selectedShipId
            );
            if (selectedShip) {
                this.manageService
                    .updateShipInformation(
                        this.context?.bookingDetails.bookingID,
                        selectedShip
                    )
                    .then(() => {
                        this.close();
                    })
                    .catch(() => {
                        this.status$.next('error');
                    });
            }
        } else {
            // if they're the same, close the modal without updating
            this.close();
        }
    }

    close(): void {
        this.status$.next('idle');
        this.manageService.closeModifyCruiseModal();
    }
}
