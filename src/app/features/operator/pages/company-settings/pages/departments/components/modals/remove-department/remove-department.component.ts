import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { DepartmentListItem, UIStatus } from '@app/core';
import { UIState, DepartmentsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-department-modal',
    templateUrl: './remove-department.component.html',
    styleUrls: ['./remove-department.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
    ],
})
export class DeleteDepartmentModalComponent {
    uiState = inject(UIState);
    departmentsState = inject(DepartmentsState);
    removeDepartment$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeDepartment),
        distinctUntilChanged()
    );
    isOpen$ = this.removeDepartment$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeDepartment$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(config: DepartmentListItem): void {
        this.status$.next('loading');
        this.departmentsState
            .deleteDepartment(config.departmentId, false)
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
        this.uiState.closeRemoveDepartmentModal();
    }
}
