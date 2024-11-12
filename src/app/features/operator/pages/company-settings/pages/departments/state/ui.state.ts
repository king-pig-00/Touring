import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DepartmentListItem } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addChildDepartment: {
            isOpen: boolean;
            context?: DepartmentListItem;
        };
        editDepartment: {
            isOpen: boolean;
            context?: DepartmentListItem;
        };
        removeDepartment: {
            isOpen: boolean;
            context?: DepartmentListItem;
        };
    }>({
        addChildDepartment: {
            isOpen: false,
        },
        editDepartment: {
            isOpen: false,
        },
        removeDepartment: {
            isOpen: false,
        },
    });

    openAddChildDepartmentModal(context: DepartmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            addChildDepartment: {
                isOpen: true,
                context,
            },
        });
    }

    closeAddChildDepartmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            addChildDepartment: {
                isOpen: false,
            },
        });
    }

    openEditDepartmentModal(context: DepartmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editDepartment: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditDepartmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            editDepartment: {
                isOpen: false,
            },
        });
    }

    openRemoveDepartmentModal(context: DepartmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeDepartment: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveDepartmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeDepartment: {
                isOpen: false,
            },
        });
    }
}
