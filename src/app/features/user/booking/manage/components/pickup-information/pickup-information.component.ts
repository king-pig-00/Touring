import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiPickupLocationItem, BookingDetails } from '@app/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ManageService } from '../../manage.service';

@Component({
    standalone: true,
    selector: 'app-pickup-information',
    templateUrl: './pickup-information.component.html',
    styleUrls: ['./pickup-information.component.scss'],
    imports: [CommonModule, FormsModule, DropdownModule],
})
export class PickupInformationComponent {
    @Input() set details(value: BookingDetails) {
        this.bookingDetails = value;
        this.createMap(value.latitude, value.longitude);
        this.pickupLocationId = value.bookingPickUp;
    }
    @Input() pickupLocations: ApiPickupLocationItem[] = [];
    sanitizer = inject(DomSanitizer);
    manageService = inject(ManageService);
    bookingDetails: BookingDetails | undefined;
    mapHTML: SafeResourceUrl | undefined;
    pickupLocationId: string | undefined = undefined;

    private createMap(latitude: number, longitude: number): void {
        this.mapHTML = undefined;
        if (!latitude || !longitude) {
            return;
        }
        const mapUrl = `https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=${latitude},%20${longitude}+(Test)&amp;t=&amp;z=17&amp;ie=UTF8&amp;iwloc=B&amp;output=embed`;
        const mapEmbed = `
    <div style="width: 100%">
      <iframe
        width="100%"
        height="300px"
        frameborder="0"
        scrolling="no"
        marginheight="0"
        marginwidth="0"
        src=${mapUrl}>
      </iframe>
    </div>
    `;
        this.mapHTML = this.sanitizer.bypassSecurityTrustHtml(mapEmbed);
    }

    updatePickupLocation(): void {
        if (!this.bookingDetails?.bookingID) {
            return;
        }
        this.manageService.updateTourDetails(this.bookingDetails.bookingID, {
            bookingPickUp: this.pickupLocationId,
        });
    }
}
