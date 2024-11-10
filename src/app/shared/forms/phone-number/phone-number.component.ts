/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhonenumberAreacode } from '@app/core';
import { DropdownModule } from 'primeng/dropdown';
import {
    AbstractControl,
    ControlValueAccessor,
    FormsModule,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PhoneNumberUtil } from 'google-libphonenumber';

@Component({
    standalone: true,
    selector: 'app-phone-number',
    templateUrl: './phone-number.component.html',
    styleUrls: ['./phone-number.component.scss'],
    imports: [CommonModule, FormsModule, DropdownModule, InputTextModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: PhoneNumberComponent,
        },
        {
            provide: NG_VALIDATORS,
            multi: true,
            useExisting: PhoneNumberComponent,
        },
    ],
})
export class PhoneNumberComponent implements ControlValueAccessor, Validator {
    areaCodes = Object.values(PhonenumberAreacode);

    selectedCountry: any = undefined;
    isValid = false;
    phoneUtil = PhoneNumberUtil.getInstance();

    cd = inject(ChangeDetectorRef);
    @Input() phoneNumber = '';
    @Input() required = false;

    onChange = (value: string) => {};
    onTouched = () => {};
    touched = false;
    dirty = false;
    disabled = false;

    writeValue(value: string) {
        if (value) {
            const cleanedUpPhoneNumber = value.replace(/[^0-9]/g, '');
            try {
                const formattedPhoneNumber = this.phoneUtil.parse(value);
                const iso = this.phoneUtil
                    .getRegionCodeForNumber(formattedPhoneNumber)
                    ?.toLowerCase();
                if (iso) {
                    this.selectDefaultCountry(iso);
                } else {
                    this.selectDefaultCountry();
                }
                this.phoneNumber =
                    formattedPhoneNumber.getNationalNumber()?.toString() || '';

                this.validatePhoneNumber();
            } catch (err) {
                if (value) {
                    this.phoneNumber = cleanedUpPhoneNumber;
                }
                this.selectDefaultCountry();
                // automatically validate and emit so we get the correct formatted phone number
                // in our form listeners
                this.validatePhoneNumber();
            }
        } else {
            this.phoneNumber = '';
            this.selectDefaultCountry();
        }
    }

    selectDefaultCountry(iso = 'us'): void {
        this.selectedCountry = PhonenumberAreacode[iso];
    }

    registerOnChange(onChange: any) {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any) {
        this.onTouched = onTouched;
    }

    markAsTouched() {
        this.markAsDirty();
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    markAsDirty() {
        this.dirty = true;
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
    }

    validate(control: AbstractControl): ValidationErrors | null {
        // only run checks when its required
        if (!this.required && !control.value) {
            return null;
        }
        if (control.touched) {
            this.markAsDirty();
        }

        if (this.isValid) {
            return null;
        }

        return {
            invalidPhoneNumber: true,
        };
    }

    areacodeChange(): void {
        this.onTouched();
        this.validatePhoneNumber();
    }

    phoneNumberChange(): void {
        this.onTouched();
        this.validatePhoneNumber();
    }

    validatePhoneNumber(): boolean {
        if (this.selectedCountry) {
            try {
                if (!this.required && !this.phoneNumber) {
                    this.isValid = true;
                    this.onChange('');
                } else {
                    const iso = this.selectedCountry.iso.toUpperCase();
                    const formattedPhoneNumber = this.phoneUtil.parse(
                        `+${this.selectedCountry.areaCode}${this.phoneNumber}`,
                        iso
                    );
                    this.isValid = this.phoneUtil.isValidNumberForRegion(
                        formattedPhoneNumber,
                        iso
                    );
                    this.onChange(
                        `+${formattedPhoneNumber.getCountryCode()}${formattedPhoneNumber.getNationalNumber()}`
                    );
                }
            } catch (err) {
                this.isValid = false;
            }
        } else {
            this.isValid = false;
            this.onChange('');
        }
        return this.isValid;
    }
}
