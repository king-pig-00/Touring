import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
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
        console.log('test');
        this.formType$.next(config);
    }

    signin(): void {
        const formValues = this.signinForm.getRawValue();
        console.log(formValues);
        // this.userState
        //   .signin(formValues.email ?? '', formValues.password ?? '')
        //   .then(() => {
        //     this.refresh();
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
    }
    signup(): void {
        const formValues = this.signupForm.getRawValue();
        console.log(formValues);
        // this.userState
        //   .signin(formValues.email ?? '', formValues.password ?? '')
        //   .then(() => {
        //     this.refresh();
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
    }
}
