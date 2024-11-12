import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { DepartmentListItem, UIStatus } from '@app/core';
import { UIState, DepartmentsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-department-modal',
    templateUrl: './edit-department.component.html',
    styleUrls: ['./edit-department.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
    ],
})
export class EditDepartmentModalComponent {
    uiState = inject(UIState);
    departmentsState = inject(DepartmentsState);
    editDepartment$ = this.uiState.modals$.pipe(
        map((modals) => modals.editDepartment),
        distinctUntilChanged()
    );
    isOpen$ = this.editDepartment$.pipe(map((modal) => modal.isOpen));
    context$ = this.editDepartment$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    editDepartmentForm = new FormGroup({
        departmentName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    save(config: DepartmentListItem): void {
        if (this.editDepartmentForm.invalid) {
            Object.values(this.editDepartmentForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editDepartmentForm.getRawValue();
        this.departmentsState
            .saveDepartment({
                departmentId: config.departmentId,
                departmentName: formValues.departmentName ?? '',
                parentDepartmentId: config.parentDepartmentId,
                companyId: 0,
            })
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditDepartmentModal();
    }
}
