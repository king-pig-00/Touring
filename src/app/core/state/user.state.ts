import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from '@angular/router';
import {
    BehaviorSubject,
    Subscription,
    combineLatest,
    debounceTime,
    filter,
    lastValueFrom,
    map,
    switchMap,
    take,
} from 'rxjs';

import { AuthService, StorageService } from '../services';
import { User } from '../models';

@Injectable({
    providedIn: 'root',
})
export class UserState {
    router = inject(Router);
    authService = inject(AuthService);
    storageService = inject(StorageService);
    user$ = new BehaviorSubject<User | undefined>(undefined);

    init() {}

    signin(email: string, password: string) {
        return lastValueFrom(this.authService.signin(email, password)).then(
            (res) => {
                if (res.success) {
                    this.storageService.setItem('authToken', res.data.token);
                    this.storageService.setItem(
                        'userName',
                        res.data.firstName + ' ' + res.data.lastName
                    );
                    this.storageService.setItem(
                        'redirectUrl',
                        res.data.redirectUrl ?? ''
                    );
                    this.user$.next(res.data);
                    window.location.href = res.data.redirectUrl ?? '/dashboard';
                    return Promise.resolve();
                } else {
                    return Promise.reject(res.error);
                }
            }
        );
    }

    signup(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        return lastValueFrom(
            this.authService.signup(firstName, lastName, email, password)
        ).then((res) => {
            if (res.success) {
                this.user$.next(res.data);
                return Promise.resolve();
            } else {
                return Promise.reject(res.error);
            }
        });
    }

    signout() {
        this.storageService.clear();
        this.user$.next(undefined);
        this.router.navigate(['/home']);
    }
}
