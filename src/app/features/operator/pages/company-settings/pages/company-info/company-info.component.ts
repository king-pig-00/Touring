import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';

import {
    CountryList,
    StatesList,
    countryStateList,
    TimezoneList,
    timezoneList,
} from '@app/core';
import { PhoneNumberComponent } from '@app/shared';
import { CompanyInfoState } from './company-info.state';

@Component({
    standalone: true,
    selector: 'app-company-info',
    templateUrl: './company-info.component.html',
    styleUrl: './company-info.component.scss',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        InputTextareaModule,
        PhoneNumberComponent,
    ],
    providers: [CompanyInfoState],
})
export class CompanyInfoComponent {
    companyInfoState = inject(CompanyInfoState);

    private isDestroyed$ = new Subject<void>();
    logoImgSrc$ = new BehaviorSubject<string | undefined>(undefined);
    countries: CountryList[] = [];
    states: StatesList[] = [];
    timezones: TimezoneList[] = [];
    orgId: number = 0;
    orgInfoId: number = 0;
    companyInfoForm = new FormGroup({
        companyName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        email: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        description: new FormControl<string | null>(null),
        generalPhone: new FormControl<string | null>(null),
        fax: new FormControl<string | null>(null),
        address: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        address2: new FormControl<string | null>(null),
        city: new FormControl<string | null>(null, {
            validators: [Validators.required],
        }),
        country: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        state: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        zipCode: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        website: new FormControl<string | null>(null),
        administrator: new FormControl<string | null>(null),
        timeZone: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    ngOnInit(): void {
        this.companyInfoState.init();
        this.countries = countryStateList;
        this.timezones = timezoneList;
        this.companyInfoForm.controls.country.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((country) => {
                this.companyInfoForm.controls.state.reset();
                if (country) {
                    this.loadStates(country);
                }
            });
        this.setupForm();
    }

    loadStates(code: string) {
        const selectedCountry = this.countries.find((c) => c.code2 === code);
        this.states = selectedCountry ? selectedCountry.states : [];
    }

    setupForm(): void {
        this.companyInfoState.companyInfo$.subscribe((companyInfo) => {
            if (companyInfo) {
                this.companyInfoForm.patchValue({
                    companyName: companyInfo.orgName,
                    ...companyInfo.info,
                });
                this.orgId = companyInfo.orgId;
                this.orgInfoId = companyInfo.info.orgInfoId;
                const logo = `data:image/png;base64, ${companyInfo.info.logo}`;
                this.logoImgSrc$.next(logo);
            }
        });
    }

    onImageSelect(event: Event): void {
        const file = (<HTMLInputElement>event.target).files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            this.logoImgSrc$.next(base64String);
        };
        reader.readAsDataURL(file);
    }

    saveCompanyInfo(): void {
        if (this.companyInfoForm.invalid) {
            Object.values(this.companyInfoForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.companyInfoForm.getRawValue();

        let companyLogo: string = '';
        this.logoImgSrc$.subscribe((logo) => {
            if (logo) {
                const logoArr = logo.split('base64,');
                companyLogo = logoArr[1];
            }
        });

        this.companyInfoState.saveCompanyInfo({
            orgId: this.orgId,
            orgName: formValues.companyName ?? '',
            parentOrgId: 0,
            info: {
                orgInfoId: this.orgInfoId,
                email: formValues.email ?? '',
                description: formValues.description ?? '',
                generalPhone: formValues.generalPhone ?? '',
                fax: formValues.fax ?? '',
                address: formValues.address ?? '',
                address2: formValues.address2 ?? '',
                city: formValues.country ?? '',
                country: formValues.country ?? '',
                state: formValues.state ?? '',
                zipCode: formValues.zipCode ?? '',
                logo: companyLogo,
                website: formValues.website ?? '',
                administrator: formValues.administrator ?? '',
                timeZone: formValues.timeZone ?? '',
            },
        });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }
}
