import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    AbstractControl,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { UserState, UIStatus } from '@app/core';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
})
export class HomeComponent {
    router = inject(Router);
    userState = inject(UserState);

    formType$ = new BehaviorSubject<string>('welcome');
    statuses$ = new BehaviorSubject<{
        signin: UIStatus;
        signup: UIStatus;
    }>({
        signin: 'idle',
        signup: 'idle',
    });
    signinForm = new FormGroup({
        email: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required, Validators.email],
        }),
        password: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });
    signupForm = new FormGroup(
        {
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
                validators: [Validators.required, Validators.email],
            }),
            password: new FormControl<string | null>(null, {
                nonNullable: true,
                validators: [Validators.required, Validators.minLength(6)],
            }),
            confirmPassword: new FormControl<string | null>(null, {
                nonNullable: true,
                validators: [Validators.required, Validators.minLength(6)],
            }),
        },
        {
            validators: this.checkPassword,
        }
    );

    checkPassword(
        formGroup: AbstractControl
    ): { [key: string]: boolean } | null {
        const password = formGroup.get('password')?.value;
        const confirmPassword = formGroup.get('confirmPassword')?.value;
        if (password === confirmPassword) {
            return null;
        }
        return { passwordRequired: true };
    }

    get passwordControl() {
        return this.signupForm.get('password');
    }

    showForm(config: string): void {
        this.formType$.next(config);
    }

    signin() {
        if (this.signinForm.invalid) {
            Object.values(this.signinForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.signinForm.getRawValue();
        this.userState
            .signin(formValues.email ?? '', formValues.password ?? '')
            .then(() => {
                this.updateStatus('signin', 'success');
            })
            .catch(() => {
                this.updateStatus('signin', 'error');
            });
    }

    signup() {
        if (this.signupForm.invalid) {
            Object.values(this.signupForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.signupForm.getRawValue();
        this.userState
            .signup(
                formValues.firstName ?? '',
                formValues.lastName ?? '',
                formValues.email ?? '',
                formValues.password ?? ''
            )
            .then(() => {
                this.updateStatus('signup', 'success');
                this.signupForm.reset();
            })
            .catch(() => {
                this.updateStatus('signup', 'error');
            });
    }

    private updateStatus(key: 'signin' | 'signup', status: UIStatus): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
