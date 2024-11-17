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
    selector: 'app-add-child-department-modal',
    templateUrl: './add-child-department.component.html',
    styleUrls: ['./add-child-department.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
    ],
})
export class AddChildDepartmentModalComponent {
    uiState = inject(UIState);
    departmentsState = inject(DepartmentsState);
    addChildDepartment$ = this.uiState.modals$.pipe(
        map((modals) => modals.addChildDepartment),
        distinctUntilChanged()
    );
    isOpen$ = this.addChildDepartment$.pipe(map((modal) => modal.isOpen));
    context$ = this.addChildDepartment$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    statuses$ = this.departmentsState.statuses$;
    addChildDepartmentForm = new FormGroup({
        departmentName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    add(config: DepartmentListItem): void {
        if (this.addChildDepartmentForm.invalid) {
            Object.values(this.addChildDepartmentForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.addChildDepartmentForm.getRawValue();
        this.departmentsState
            .saveDepartment({
                orgId: -1,
                orgName: formValues.departmentName ?? '',
                parentOrgId: config.orgId,
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
        this.addChildDepartmentForm.reset();
        this.uiState.closeAddChildDepartmentModal();
    }
}
