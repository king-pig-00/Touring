import { Injectable, inject } from '@angular/core';
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
    authService = inject(AuthService);
    storageService = inject(StorageService);
    user$ = new BehaviorSubject<User | undefined>(undefined);

    signin(email: string, password: string) {
        return lastValueFrom(this.authService.signin(email, password))
            .then((res) => {
                this.storageService.setItem('authToken', res.data.token);
                this.user$.next(res.data);
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    signup(username: string, email: string, password: string) {
        // const role = 'user';
        // return lastValueFrom(
        //   this.authService.signup(username, email, password, role)
        // )
        //   .then((res) => {
        //     // this.updateIsLoading('saveHousingData', 'success');
        //     this.user$.next(res.data);
        //   })
        //   .then(() => {
        //     // this.refresh();
        //     return Promise.resolve();
        //   })
        //   .catch(() => {
        //     // this.updateIsLoading('saveHousingData', 'error');
        //   });
        // this.authService.register(username, email, password).subscribe({
        //     next: data => {
        //       console.log(data);
        //       this.isSuccessful = true;
        //       this.isSignUpFailed = false;
        //     },
        //     error: err => {
        //       this.errorMessage = err.error.message;
        //       this.isSignUpFailed = true;
        //     }
        //   });
    }

    signout() {}
}
