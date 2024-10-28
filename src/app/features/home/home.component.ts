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
    AbstractControl,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UserState } from '@app/core';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
    ],
    providers: [MessageService],
})
export class HomeComponent {
    router = inject(Router);
    userState = inject(UserState);
    messageService = inject(MessageService);

    formType$ = new BehaviorSubject<string>('welcome');

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
                this.router.navigate([
                    '/operator/company-settings/company-info',
                ]);
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Invalid email or password.',
                });
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
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Your account has been created successfully.',
                });
                this.signupForm.reset();
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'This email is already registered. Please use a different email.',
                });
            });
    }
}
