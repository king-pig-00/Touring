import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from '@angular/router';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { UserState } from '@app/core';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    router = inject(Router);
    userState = inject(UserState);

    formType$ = new BehaviorSubject<string>('welcome');

    signinForm = new FormGroup({
        email: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        password: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    signupForm = new FormGroup({
        firstName: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        lastName: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        email: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        password: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        confirmPassword: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    showForm(config: string): void {
        this.formType$.next(config);
    }

    signin() {
        const formValues = this.signinForm.getRawValue();
        this.userState
            .signin(formValues.email ?? '', formValues.password ?? '')
            .then((res) => {
                this.router.navigate([
                    '/operator/company-settings/company-info',
                ]);
            })
            .catch(() => {});
    }

    signup() {
        const formValues = this.signupForm.getRawValue();
        this.userState
            .signup(
                formValues.firstName ?? '',
                formValues.lastName ?? '',
                formValues.email ?? '',
                formValues.password ?? '',
            )
            .then((res) => {
                this.router.navigate([
                    '/operator/company-settings/company-info',
                ]);
            })
            .catch(() => {});
    }
}
