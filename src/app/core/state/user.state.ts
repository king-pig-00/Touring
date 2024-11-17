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
import { UserApiService } from '../services/api/user.service';

@Injectable({
    providedIn: 'root',
})
export class UserState {
    router = inject(Router);
    authService = inject(AuthService);
    storageService = inject(StorageService);
    userService = inject(UserApiService);
    user$ = new BehaviorSubject<User | undefined>(undefined);

    signin(email: string, password: string) {
        return lastValueFrom(this.authService.signin(email, password)).then(
            (res) => {
                if (res.success) {
                    this.storageService.setItem(
                        'authToken',
                        res.data.token ?? ''
                    );
                    this.user$.next(res.data);
                    window.location.href = res.data.redirectUrl ?? '/user';
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

    getUserInfo(): Promise<User | undefined> {
        if (this.user$.getValue()) {
            return Promise.resolve(this.user$.getValue());
        } else {
            if (this.isLoadingUser) {
                return lastValueFrom(
                    this.user$.pipe(
                        filter((user) => !!user),
                        take(1)
                    )
                );
            }
            return this.loadUserInfo().then(() => {
                return Promise.resolve(this.user$.getValue());
            });
        }
    }

    private isLoadingUser = false;
    loadUserInfo(): Promise<User | undefined> {
        this.isLoadingUser = true;
        return lastValueFrom(
            this.userService.getUser().pipe(map((res) => res.data))
        )
            .then((user) => {
                this.user$.next(user);
                this.isLoadingUser = false;

                return Promise.resolve(user);
            })
            .catch(() => {
                this.isLoadingUser = false;

                this.user$.next(undefined);
                return Promise.resolve(undefined);
            });
    }
}
