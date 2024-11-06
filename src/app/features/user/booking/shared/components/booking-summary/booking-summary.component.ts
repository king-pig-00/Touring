import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { B2CBookingGroup } from '@app/core';
import { HardcodeDirective, CcIdentificationComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-booking-summary',
    templateUrl: './booking-summary.component.html',
    styleUrls: ['./booking-summary.component.scss'],
    imports: [
        CommonModule,
        TooltipModule,
        HardcodeDirective,
        CcIdentificationComponent,
    ],
    providers: [CurrencyPipe],
})
export class BookingSummaryComponent {
    @Input() set booking(value: B2CBookingGroup | undefined) {
        this.bookingDetails = value;
        const feeString = this.currencyPipe.transform(value?.fee || 0, 'USD');
        const taxString = this.currencyPipe.transform(value?.tax || 0, 'USD');
        this.costBreakdown = `Fees: ${feeString}\nTaxes: ${taxString}`;
    }

    currencyPipe = inject(CurrencyPipe);
    bookingDetails: B2CBookingGroup | undefined;
    costBreakdown = '';
}
