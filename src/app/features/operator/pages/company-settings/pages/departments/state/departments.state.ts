import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

import {
    UIStatus,
    UserState,
    DepartmentListItem,
    CompanySettingsApiService,
} from '@app/core';

@Injectable()
export class DepartmentsState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);
    departmentList$ = new BehaviorSubject<DepartmentListItem[]>([]);

    statuses$ = new BehaviorSubject<{
        loadCompanyDepartments: UIStatus;
        saveCompanyDepartment: UIStatus;
    }>({
        loadCompanyDepartments: 'idle',
        saveCompanyDepartment: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        this.updateStatus('loadCompanyDepartments', 'idle');
        this.updateStatus('saveCompanyDepartment', 'idle');
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {
            this.getDepartments();
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    getDepartments(): Promise<void> {
        const companyId = this.userState.user$.getValue()?.companyId ?? 0;
        this.updateStatus('loadCompanyDepartments', 'loading');
        this.departmentList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getDepartmentList(companyId)
        )
            .then((res) => {
                this.updateStatus('loadCompanyDepartments', 'success');
                this.departmentList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyDepartments', 'error');
                return Promise.reject(error);
            });
    }

    saveDepartment(config: DepartmentListItem): Promise<void> {
        this.updateStatus('saveCompanyDepartment', 'loading');
        return this.userState.getUserInfo().then((user) => {
            return lastValueFrom(
                this.companySettingsApiService.saveDepartment({
                    ...config,
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateStatus('saveCompanyDepartment', 'success');
                        return Promise.resolve();
                    } else {
                        this.updateStatus('saveCompanyDepartment', 'error');
                        return Promise.reject(res.error);
                    }
                })
                .catch((error) => {
                    this.updateStatus('saveCompanyDepartment', 'error');
                    return Promise.reject(error);
                });
        });
    }

    deleteDepartment(orgId: number): Promise<void> {
        return lastValueFrom(
            this.companySettingsApiService.deleteDepartment(orgId)
        ).then((res) => {
            if (!res.success) {
                this.updateStatus('saveCompanyDepartment', 'error');
                return Promise.reject(res.error);
            }
            this.updateStatus('saveCompanyDepartment', 'success');
            this.refresh();
            return Promise.resolve();
        });
    }

    private updateStatus(
        key: 'loadCompanyDepartments' | 'saveCompanyDepartment',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
